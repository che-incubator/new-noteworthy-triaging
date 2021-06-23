import { createApp } from "vue";
import App from "./App.vue";
import Datepicker from 'vue3-datepicker'
import createVfm from 'vue-final-modal'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";

library.add(faCommentDots);
library.add(faWindowClose);
library.add(faUser);
library.add(faFlag);
library.add(faTags);
library.add(faFolder);
library.add(faMap);
library.add(faExternalLinkAlt);
library.add(faCodeBranch);
library.add(faExchangeAlt);

createApp(App)
.component("datepicker", Datepicker)
.component("font-awesome-icon", FontAwesomeIcon)
.use(createVfm()).mount("#app");
