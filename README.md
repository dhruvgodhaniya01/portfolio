# Dhruv Godhaniya — Multi-page Portfolio

A premium multi-page portfolio for Dhruv Godhaniya, B.Tech Robotics & Automation student at Government Engineering College Rajkot (GTU).

## Public pages
- `/` — Home
- `/about.html` — About
- `/projects.html` — Project archive
- `/projects/tokicha.html`
- `/projects/hostel-management.html`
- `/projects/hotel-management.html`
- `/projects/hilla-restaurant.html`
- `/projects/portfolio-hospital.html`
- `/skills.html` — Skills
- `/journey.html` — Education and direction
- `/contact.html` — “Make Yours” project enquiry
- `/thanks.html` — Form confirmation

The public site intentionally contains **no Admin button**.

## Projects
1. Tokicha — https://tokicha.netlify.app
2. Hostel Management — https://hostelmange.netlify.app/
3. Hotel Management — https://hotelmanage1.netlify.app
4. Hilla Restaurant Cafe — https://hilla-restaurant-cafe.netlify.app
5. Portfolio Hospital — https://portfoliohospital.netlify.app

## Contact form
`contact.html` uses Netlify Forms. After deploying to Netlify, form submissions can be viewed in the Netlify dashboard and email notifications can be configured there.

## Admin
`/admin/` remains a separate protected CMS. It uses Netlify Functions + Netlify Blobs for server-side data and file storage. It is intentionally not linked from the public website.

## Honest skill positioning
Current: HTML, CSS, JavaScript, Java (intermediate), Git, GitHub, Netlify, AI-assisted development with ChatGPT/Codex.
Learning: C, AI/ML, robotics and automation.

The project case studies avoid claiming unverified frameworks or professional experience.

## Deployment
Deploy the project root to Netlify. The included `netlify.toml` publishes the root and routes `/api/*` to the Netlify Function.

Before using the admin, configure the environment variables described in `BACKEND_SETUP.md`.

## Navigation and project interactions
- Navigation uses **Projects** instead of Work.
- Clicking a project image opens that project's live website in a new tab.
- Clicking **Case study ↗** opens the detailed case-study page.
- Primary, navigation, CTA, and project-action buttons have larger hit areas and richer hover/focus states.
