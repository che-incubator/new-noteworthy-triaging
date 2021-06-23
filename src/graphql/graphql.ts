import { graphql } from "@octokit/graphql";
import MarkdownIt from "markdown-it";

export class RepositoryQuery {
  constructor(private githubToken: string) {}

  updateRepository(repo: string) {
    if (repo.startsWith("eclipse-che/")) {
      repo = repo.substring("eclipse-che/".length);
    }

    if (repo.startsWith("che-")) {
      repo = repo.substring("che-".length);
    }

    return repo;
  }

  updateLabels(node: any) {
    return node.nodes.map((node: any) => {
      return {
        name: node.name,
        color: node.color,
      };
    });
  }

  updateCategory(title: string) {
    if (title.startsWith("fix:") || title.startsWith("fix(")) {
      return "fix";
    }
    if (title.startsWith("chore:") || title.startsWith("chore(")) {
      return "chore";
    }
    if (title.startsWith("feat:") || title.startsWith("feat(")) {
      return "feat";
    }
    return "N/A";
  }

  renderMarkdown(content: string) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    const result = md.render(content);
    return result;
  }

  renderMarkdownInline(content: string) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    const result = md.renderInline(content);
    return result;
  }

  public async getPullRequestsMerged(
    listOfRepositories: string[],
    afterDate: string,
    cursor?: string,
    previousResult?: unknown[]
  ): Promise<any> {
    const { search } = await graphql(
      `
      query getMergedPRs($cursorAfter: String) {
        rateLimit {
          cost
          remaining
          resetAt
        }
    search(query: "is:merged is:pr repo:${listOfRepositories.join(
      " "
    )} merged:>=${afterDate} ", type: ISSUE, first: 100, after: $cursorAfter) {
      issueCount
      pageInfo {
        ... on PageInfo {
          endCursor
          hasNextPage
        }
      }
      edges {
        node {
          ... on PullRequest {
            number
            title
            body
            repository {
              nameWithOwner
            }
            changedFiles
            baseRefName
            author {
              login
            }
            milestone {
              title
            }
            labels(first: 100) {
              nodes {
                ... on Label {
                  name
                  color
                }
              }
            }  
            mergedAt
            url
            comments {
              totalCount
            }
          }
        }
      }
    }
  }`,
      {
        cursorAfter: cursor,
        headers: {
          authorization: `token ${this.githubToken}`,
        },
      }
    );

    let allGraphQlResponse;
    if (previousResult) {
      allGraphQlResponse = previousResult.concat(search.edges);
    } else {
      allGraphQlResponse = search.edges;
    }

    // need to loop again
    if (search.pageInfo.hasNextPage) {
      // needs to redo the search starting from the last search
      return this.getPullRequestsMerged(
        listOfRepositories,
        afterDate,
        search.pageInfo.endCursor,
        allGraphQlResponse
      );
    }

    // values are in search.edges
    const edges = allGraphQlResponse;

    const transformed = edges.map((edge: any) => {
      return {
        title: this.renderMarkdownInline(edge.node.title),
        number: edge.node.number,
        url: edge.node.url,
        body: this.renderMarkdown(edge.node.body),
        rawBody: edge.node.body,
        repo: this.updateRepository(edge.node.repository.nameWithOwner),
        user: edge.node.author.login,
        category: this.updateCategory(edge.node.title),
        milestone: edge.node.milestone?.title || "N/A",
        nbComments: edge.node.comments.totalCount,
        labels: this.updateLabels(edge.node.labels),
        baseRefName: edge.node.baseRefName,
        changedFiles: edge.node.changedFiles,
      };
    });

    // need to sort by comments
    transformed.sort((first: any, second: any) => {
      if (first.nbComments > second.nbComments) return -1;
      if (first.nbComments < second.nbComments) return 1;
      return 0;
    });

    return transformed;
  }

  public async getIssues(
    referencedIssues: number[],
    cursor?: string,
    previousResult?: unknown[]
  ): Promise<any> {
    
    if (referencedIssues.length === 0) {
      return [];
    }

    // if too many referencedIssues, split as query length should be < 256 characters
    const maxNumberOfIssues = 30;
    if (referencedIssues.length > maxNumberOfIssues) {
      // remove maxNumberOfIssues elements from the array
      const arrayEnd = referencedIssues.slice(maxNumberOfIssues);
      // keep the first maxNumberOfIssues
      referencedIssues.length = maxNumberOfIssues;
      const firstIssues = await this.getIssues(
        referencedIssues,
        cursor,
        previousResult
      );
      const remainingIssues = await this.getIssues(
        arrayEnd,
        cursor,
        previousResult
      );
      // concat two results
      return firstIssues.concat(remainingIssues);
    }

    const { search } = await graphql(
      `
      query getReferencedIssues($cursorAfter: String) {
        rateLimit {
          cost
          remaining
          resetAt
        }
    search(query: "is:issue repo:eclipse/che issue: ${referencedIssues.join(
      " "
    )}", type: ISSUE, first: 100, after: $cursorAfter) {
      issueCount
      pageInfo {
        ... on PageInfo {
          endCursor
          hasNextPage
        }
      }
      edges {
        node {
          ... on Issue {
            number
            url
            comments {
              totalCount
            }
            title
            body
            author {
              login
            }
            milestone {
              title
            }
            labels(first: 100) {
                nodes {
                  ... on Label {
                    name
                    color
                  }
                }
            }
          }
        }
      }
    }
  }`,
      {
        cursorAfter: cursor,
        headers: {
          authorization: `token ${this.githubToken}`,
        },
      }
    );

    let allGraphQlResponse;
    if (previousResult) {
      allGraphQlResponse = previousResult.concat(search.edges);
    } else {
      allGraphQlResponse = search.edges;
    }

    // need to loop again
    if (search.pageInfo.hasNextPage) {
      // needs to redo the search starting from the last search
      return this.getIssues(
        referencedIssues,
        search.pageInfo.endCursor,
        allGraphQlResponse
      );
    }

    // values are in search.edges
    const edges = allGraphQlResponse;
    const transformed = edges.map((edge: any) => {
      return {
        url: edge.node.url,
        title: this.renderMarkdownInline(edge.node.title),
        number: edge.node.number,
        body: this.renderMarkdown(edge.node.body),
        rawBody: edge.node.body,
        author: edge.node.author.login,
        milestone: edge.node.milestone?.title || "N/A",
        nbComments: edge.node.comments.totalCount,
        labels: this.updateLabels(edge.node.labels),
      };
    });
    return transformed;
  }
}
