export class PullRequestLinkedIssuesExtractor {
  extractLinkedIssues(pullRequest: any): string[] {


    // first, we remove any commented
    const bodyWithoutComments = pullRequest.rawBody.replace(/<!--.*?-->/sg, "")

    const regexpBlock =
      /### What issues does this PR fix or reference\?.*?(###|$)/s;
    const result: RegExpExecArray | null = regexpBlock.exec(
        bodyWithoutComments
    );
    if (result === null) {
      return [];
    }

    const txtBlock = result[0];
    const issuesFound: string[] = [];

    // now extract github issues from this block with full format
    const cheIssueLongMatch = /https:\/\/github\.com\/.*?\/issues\/\d*/gm;
    let cheIssueLongMatchResult: RegExpExecArray | null;

    while (
      (cheIssueLongMatchResult = cheIssueLongMatch.exec(txtBlock)) !== null
    ) {
      issuesFound.push(cheIssueLongMatchResult[0]);
    }

    // now extract CRW issues from this block with full format
    const crwIssueLongMatch = /https:\/\/issues\.redhat\.com\/browse\/CRW-\d*/gm;
    let crwIssueLongMatchResult: RegExpExecArray | null;

    while (
      (crwIssueLongMatchResult = crwIssueLongMatch.exec(txtBlock)) !== null
    ) {
      issuesFound.push(crwIssueLongMatchResult[0]);
    }

    // now extract github issues from short format
    const issueShortMatch = /#(\d+)/gm;
    let issueShortMatchResult: RegExpExecArray | null;

    while ((issueShortMatchResult = issueShortMatch.exec(txtBlock)) !== null) {
      const issue = `https://github.com/eclipse/che/issues/${issueShortMatchResult[1]}`;
      issuesFound.push(issue);
    }
    return issuesFound;
  }
}
