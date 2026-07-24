/**
 * Application entry point.
 * Renders every section in DOM order then initialises cross-cutting behaviours.
 * Each render function is self-contained: it creates its own DOM node,
 * attaches event listeners, and appends itself to the provided container.
 */

import { renderHeader }      from "./components/header.js";
import { renderFooter }      from "./components/footer.js";

import { renderHero }        from "./sections/hero.js";
import { renderStats }       from "./sections/stats.js";
import { renderAbout }       from "./sections/about.js";
import { renderSkills }      from "./sections/skills.js";
import { renderProjects }    from "./sections/projects.js";
import { renderLaunched }    from "./sections/launched.js";
import { renderExperience }  from "./sections/experience.js";
import { renderCredentials } from "./sections/credentials.js";
import { renderContact }     from "./sections/contact.js";

import { initScrollReveal }  from "./utils/animations.js";
import { initAIBackground }  from "./utils/canvas.js";
import { fetchContent }      from "./services/content-api.js";

const content = await fetchContent();

const app  = document.getElementById("app");
const main = document.createElement("main");

renderHeader(app);
app.appendChild(main);

renderHero(main, content.hero);
renderStats(main, content.stats);
renderAbout(main, content.about);
renderSkills(main, content.skills);
renderProjects(main, content.projects);
renderLaunched(main, content.launched);
renderExperience(main, content.experience);
renderCredentials(main, content.credentials);
renderContact(main, content.contact);

renderFooter(app);

// Cross-section behaviours run after all markup is in the DOM.
initScrollReveal();
initAIBackground();
