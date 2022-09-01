<template>
  <nav class="navbar navbar-dark bg-dark">
    <div class="container-fluid">
      <div class="row no-gutters" style="width: 100%">
        <div class="col-2">
          <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1">Since</span>
            </div>
            <datepicker
              v-model="dateTime"
              :upper-limit="dateTimeUpperLimit"
              :lower-limit="dateTimeLowerLimit"
            />
          </div>
        </div>
        <div class="col-4">
          <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1"
                >GitHub Token</span
              >
            </div>
            <form>
              <input
                type="text"
                value="My github token"
                hidden
                autocomplete="username"
              />
              <input
                type="password"
                v-model="githubTokenValue"
                class="form-control"
                autocomplete="current-password"
                placeholder="Enter Github Token"
              />
            </form>
          </div>
        </div>
        <div class="col-4">
          <button class="btn btn-primary" @click="searchPullRequests">
            List the pull requests
          </button>
        </div>
      </div>
      <div
        class="row"
        style="width: 100%"
        v-if="requestFinished"
      >
        <div class="col-2">
          <div class="form-check">
            <input
              class="form-check-input"
              v-model="hideBots"
              type="checkbox"
            />
            <label
              style="color: white"
              class="form-check-label"
              for="flexCheckChecked"
              title="Hide dependabot, che-bot and che-incubator-bot PRs"
            >
              <span v-if="hideBots === true">Hide bots</span
              ><span v-if="hideBots === false">Show bots</span>({{
                filterIncludeBots(pullRequests).length
              }})
            </label>
          </div>
        </div>
        <div class="col-2">
          <div class="form-check">
            <input
              class="form-check-input"
              v-model="hideChoreCi"
              type="checkbox"
            />
            <label
              style="color: white"
              class="form-check-label"
              for="flexCheckChecked"
              title="Hide all PRs with title having chore: or chore(something) or ci: prefix"
            >
              <span v-if="hideChoreCi === true">Hide chore/ci</span
              ><span v-if="hideChoreCi === false">Show chore/ci</span>({{
                filterIncludeChoreCi(pullRequests).length
              }})
            </label>
          </div>
        </div>
        <div class="col-2">
          <div class="form-check">
            <input
              class="form-check-input"
              v-model="hideCustomBranches"
              type="checkbox"
            />
            <label
              style="color: white"
              class="form-check-label"
              for="flexCheckChecked"
              title="Hide all PRs merged to custom branches (like 7.y.z branches) and not to main branch"
            >
              <span v-if="hideCustomBranches === true"
                >Hide custom branches</span
              ><span v-if="hideCustomBranches === false"
                >Show custom branches</span
              >({{ filterIncludeCustomBranch(pullRequests).length }})
            </label>
          </div>
        </div>
        <div class="col-2" v-if="filteredPullRequests.length > 0">
          <button type="button" class="btn btn-secondary btn-sm">
            Matches:
            <span class="badge badge-primary btn-dark">{{
              filteredPullRequests.length
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <div
    class="alert alert-danger alert-dismissible fade show"
    v-if="currentErrorMessage"
  >
    <strong>Error!</strong> A problem has been occurred while getting pull
    requests: {{ currentErrorMessage }}
  </div>

  <div v-if="loadingInProgress === true">
    <div class="loader loader7"></div>
    <div class="loader">
      <span style="margin-top: 80px;white-space: nowrap"> {{ loadingMessage }}</span>
    </div>
  </div>

  <div v-if="requestFinished">
    <table class="table">
      <caption>
        {{
          filteredPullRequests?.length
        }}
        Pull Requests
      </caption>
      <thead class="thead-dark">
        <tr>
          <th scope="col">#</th>
          <th scope="col">
            <font-awesome-icon icon="folder" title="Related issue" />
            issues
          </th>
          <th scope="col">
            <font-awesome-icon icon="code-branch" /> pull request
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredPullRequests" :key="item.node">
          <td>
            <span class="round-circle">{{ index + 1 }}</span>
          </td>
          <td class="col-4">
            <span v-for="cheIssue in item.cheIssues" :key="cheIssue.id">
              <a href="#" @click.prevent="cheIssue.showModal = true"
                >#{{ cheIssue.number }}</a
              >&nbsp;<span v-html="getCheIssue(cheIssue.number).title"></span>
              <vue-final-modal
                :esc-to-close="true"
                v-model="cheIssue.showModal"
                classes="modal-container"
                content-class="modal-content"
              >
                <button
                  class="modal__close"
                  @click="cheIssue.showModal = false"
                >
                  <font-awesome-icon icon="window-close" />
                </button>
                <span class="modal__title">{{
                  getCheIssue(cheIssue.number).title
                }}</span>
                <div class="modal__content">
                  <p v-html="getCheIssue(cheIssue.number).body"></p>
                </div>
              </vue-final-modal>
              <!-- <v-button class="myButton" @click="item.showModal = true" >view</v-button> -->

              &nbsp;<a v-bind:href="cheIssue.url" target="github"
                ><font-awesome-icon icon="external-link-alt"
              /></a>

              <br />
              <span
                v-for="label in getCheIssueLabels(cheIssue.number)"
                :key="label.id"
                class="badge badge-pill badge-label"
                :style="itemLabelStyle(label)"
                >{{ label.name }}
              </span>
              <br />
            </span>

            <span v-for="crwIssue in item.crwIssues" :key="crwIssue.id"
              >{{ crwIssue.id }} &nbsp;<a
                v-bind:href="crwIssue.url"
                target="github"
                ><font-awesome-icon icon="external-link-alt"
              /></a>
            </span>
          </td>

          <td>
            <a href="#" @click.prevent="item.showModal = true"
              >#{{ item.number }}</a
            >&nbsp;<span v-html="item.title"></span>
            <!--<v-button @click="item.showModal = true" >#{{ item.number }} - {{ item.title }}</v-button> -->
            <vue-final-modal
              :esc-to-close="true"
              v-model="item.showModal"
              classes="modal-container"
              content-class="modal-content"
            >
              <button class="modal__close" @click="item.showModal = false">
                <font-awesome-icon icon="window-close" />
              </button>
              <span class="modal__title">{{ item.title }}</span>
              <div class="modal__content">
                <p v-html="item.body"></p>
              </div>
            </vue-final-modal>
            <!-- <v-button class="myButton" @click="item.showModal = true" >view</v-button> -->

            &nbsp;<a v-bind:href="item.url" target="github"
              ><font-awesome-icon icon="external-link-alt"
            /></a>
            <br />
            <font-awesome-icon icon="comment-dots" title="number of comments" />
            {{ item.nbComments }}
            <font-awesome-icon icon="folder" title="repository" />
            {{ item.repo }}
            <font-awesome-icon icon="user" :title="item.user" />
            {{ item.user }}
            <font-awesome-icon
              icon="exchange-alt"
              title="number of files changed"
            />
            {{ item.changedFiles }}
            <font-awesome-icon icon="flag" title="milestone" />
            {{ item.milestone }}
            <font-awesome-icon icon="code-branch" title="target branch" />
            {{ item.baseRefName }}
            <font-awesome-icon
              v-if="item.labels.length > 0"
              icon="tags"
            />&nbsp;<span
              v-for="label in item.labels"
              :key="label.id"
              class="badge badge-pill badge-label"
              :style="itemLabelStyle(label)"
              >{{ label.name }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RepositoryQuery } from "../graphql/graphql";
import { PullRequestLinkedIssuesExtractor } from "../helper/pullrequest-linked-issue-extractor";

import { ref } from "vue";
import { subDays, format } from "date-fns/fp";
import * as jsyaml from "js-yaml";

export default defineComponent({
  name: "RepositoryList",
  setup() {
    const dateTime = ref(subDays(7, new Date()));
    const dateTimeLowerLimit = ref(subDays(15, new Date()));
    const dateTimeUpperLimit = ref(new Date());

    return { dateTime, dateTimeLowerLimit, dateTimeUpperLimit };
  },
  methods: {
    async initListOfRepositories(): Promise<string[]> {
      const response = await fetch(
        "https://raw.githubusercontent.com/eclipse/che/main/.repositories.yaml",
        { method: "GET" }
      );
      let filteredRepositories: string[] = [];
      if (response.ok) {
        const content = await response.text();
        const repositoriesYaml: any = jsyaml.load(content);
        // get only URL of repositories
        filteredRepositories = repositoriesYaml.repositories
          .map((repo: any) => {
            if (repo.url.startsWith("https://github.com/")) {
              return repo.url.substring("https://github.com/".length);
            } else {
              return undefined;
            }
          });
      }
      return filteredRepositories;
    },
    getCheIssue(cheIssueNumber: number) {
      const issue = this.cheIssues.get(cheIssueNumber);
      if (!issue) {
        return {
          title:
            "warning: linked issue is not a che issue. External organization.",
        };
      }
      return issue;
    },
    getCheIssueLabels(cheIssueNumber: number): any[] {
      const issue = this.cheIssues.get(cheIssueNumber);
      if (!issue) {
        return [];
      }
      // filter out sprint, area and team labels
      return issue.labels.filter(
        (label: any) =>
          !label.name.startsWith("area/") &&
          !label.name.startsWith("sprint/") &&
          !label.name.startsWith("team/")
      );
    },
    itemLabelStyle(item: any) {
      const style = {
        background: `#${item.color}`,
      };
      return style;
    },
    filterBot(item: any) {
      return (
        item.user === "dependabot" ||
        item.user === "che-bot" ||
        item.user === "che-incubator-bot"
      );
    },
    filterExcludeBots(data: any) {
      return data.filter((item: any) => !this.filterBot(item));
    },
    filterIncludeBots(data: any) {
      return data.filter((item: any) => this.filterBot(item));
    },
    filterChoreCi(item: any) {
      return (
        item.title.startsWith("chore:") ||
        item.title.startsWith("chore(") ||
        item.title.startsWith("ci:")
      );
    },
    filterExcludeChoreCi(data: any) {
      return data.filter((item: any) => !this.filterChoreCi(item));
    },
    filterIncludeChoreCi(data: any) {
      return data.filter((item: any) => this.filterChoreCi(item));
    },
    filterCustomBranch(item: any) {
      return item.baseRefName !== "main" && item.baseRefName !== "master";
    },
    filterExcludeCustomBranch(data: any) {
      return data.filter((item: any) => !this.filterCustomBranch(item));
    },
    filterIncludeCustomBranch(data: any) {
      return data.filter((item: any) => this.filterCustomBranch(item));
    },
    async searchPullRequests() {
      // reset error message
      this.currentErrorMessage = undefined;
      this.loadingInProgress = true;
      this.requestFinished = false;
      this.loadingMessage = 'Loading repositories...';
      this.pullRequests.length = 0;
      const listOfRepositories = await this.initListOfRepositories();
      const repositoryQuery = new RepositoryQuery(this.githubTokenValue);
      // add repo: prefix
      const repositoriesQuery = listOfRepositories.map(
        (repoName) => `repo:${repoName}`
      );

      let pullRequests: [];
      this.loadingMessage = 'Fetching pull requests...';
      try {
        pullRequests = await repositoryQuery.getPullRequestsMerged(
          repositoriesQuery,
          format("yyyy-MM-dd", this.dateTime)
        );
      } catch (error) {
        this.currentErrorMessage = error;
        this.loadingInProgress = false;
        throw error;
      }

      // need to search if there are some linked Issues from these Pull Requests
      this.loadingMessage = 'Searching for referenced issues...';
      const pullRequestLinkExtractor = new PullRequestLinkedIssuesExtractor();
      const issuesReferencedByPullRequest = new Set<number>();

      pullRequests.forEach((pullRequest: any) => {
        const linkedIssues =
          pullRequestLinkExtractor.extractLinkedIssues(pullRequest);
        const cheIssues = linkedIssues
          .filter((issue) =>
            issue.startsWith("https://github.com/eclipse/che/issues/")
          )
          .map((issue) => {
            return {
              id: `CHE-${issue.substring(
                "https://github.com/eclipse/che/issues/".length
              )}`,
              url: issue,
              number: parseInt(
                issue.substring("https://github.com/eclipse/che/issues/".length)
              ),
            };
          });

        cheIssues.forEach((issue) =>
          issuesReferencedByPullRequest.add(issue.number)
        );
        const crwIssues = linkedIssues
          .filter((issue) =>
            issue.startsWith("https://issues.redhat.com/browse/CRW-")
          )
          .map((issue) => {
            return {
              id: issue.substring("https://issues.redhat.com/browse/".length),
              url: issue,
              number: parseInt(
                issue.substring("https://issues.redhat.com/browse/CRW-".length)
              ),
            };
          });

        pullRequest.cheIssues = cheIssues;
        pullRequest.crwIssues = crwIssues;
      });
      this.loadingMessage = 'Fetching referenced issues...';
      try {
        const detailsOnIssues = await repositoryQuery.getIssues(
          Array.from(issuesReferencedByPullRequest)
        );

        // store issues details
        this.cheIssues.clear();
        detailsOnIssues.forEach((issue: any) => {
          this.cheIssues.set(issue.number, issue);
        });
      } catch (error) {
        this.currentErrorMessage = error;
        throw error;
      }
      this.pullRequests = pullRequests;
      this.loadingInProgress = false;
      this.requestFinished = true;
    },
  },

  computed: {
    filteredPullRequests(): any[] {
      let data = this.pullRequests;
      if (this.hideBots) {
        data = this.filterExcludeBots(data);
      }
      if (this.hideChoreCi) {
        data = this.filterExcludeChoreCi(data);
      }
      if (this.hideCustomBranches) {
        data = this.filterExcludeCustomBranch(data);
      }
      return data;
    },
  },
  data: () => {
    return {
      showModal: false,
      hideBots: true,
      hideChoreCi: true,
      hideCustomBranches: true,
      result: [],
      responseAvailable: false,
      loadingInProgress: false,
      loadingMessage: 'Loading',
      requestFinished: false,
      pullRequests: [],
      currentErrorMessage: undefined,
      githubTokenValue: "",
      cheIssues: new Map<number, any>(),
    };
  },
  props: {
    msg: String,
  },
});
</script>

<style scoped>
::v-deep .modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90%;
  margin: 0 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background: #fff;
}
.modal__title {
  margin: 0 2rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}
.modal__content {
  flex-grow: 1;
  overflow-y: auto;
}
.modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: 0px;
}
</style>

<style scoped>
.dark-mode div::v-deep .modal-content {
  border-color: #2d3748;
  background-color: #1a202c;
}
</style>

// style for round number
<style>
.round-circle {
  border-radius: 50%;
  padding-left: 2px;
  padding-right: 2px;
  background: #888;
  border: 1px solid #888;
  color: #fff;
  text-align: center;
  font-weight: 800;
  font: 11px Verdana;
}
</style>

// style for labels
<style scoped>
.badge-label {
  margin-right: 3px;
}
</style>

// style for datepicker
<style>
.v3dp__datepicker {
  width: 120px;
}

.v3dp__datepicker input {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
</style>

// spinner
<style scoped>
@keyframes glow {
  50% {
    border-color: lime;
    width: 95%;
    box-shadow: 0px 0px 10px -2px green;
  }
  100% {
    border-color: green;
    width: 35%;
    box-shadow: 0px 0px 10px -2px green;
  }
}
.sep {
  width: 35%;
  border-bottom: 2px solid green;
  margin-bottom: 20px;
  animation: glow 8s infinite;
}

.loader {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 20px;
}
@keyframes load {
  50% {
    transform: rotatez(180deg) scale(0.2);
    border-color: orange;
  }
  100% {
    transform: rotatez(360deg) scale(1.1);
  }
}
@keyframes load7 {
  100% {
    transform: rotatez(360deg);
  }
}
.loader7::before {
  content: "";
  color: white;
  height: 50px;
  width: 50px;
  background: transparent;
  border-radius: 50%;
  border: 10px solid blue;
  border-color: #0277bd #0277bd #0277bd #81d4fa;
  animation: load7 0.6s infinite ease-in-out;
  box-shadow: 0px 0px 40px -2px skyblue;
}
</style>
