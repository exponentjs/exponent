---
title: Publishing Websites
---

## Creating a Build

- Optimize the assets for speed - `npx expo-optimize` (formerly `expo optimize`)
- Bundle the project for production - `expo build:web`
  - Creates a production ready static bundle in the `web-build/` directory. Don't edit this folder directly.
  - Uses Webpack to [optimize the project.][webpack-optimize]
  - If you make any changes to your project, you'll need to re-build for production.
  - For more help use `expo build:web --help`
  - To speed up builds you can skip the PWA asset generation with `expo build:web --no-pwa`
- You can now deploy or host this anywhere you like.

**Tips**

- Serving your site in a subfolder? Add the path to your `package.json`:

```js
/* package.json */
{
    "homepage": "/webapp"
}
```

[webpack-optimize]: https://webpack.js.org/configuration/optimization/

### Serving Locally

- [Serve CLI][serve-cli]: Quickly test how it works in production - `npx serve web-build`
- Open [`http://localhost:5000`](http://localhost:5000)
- **This is `http` only, so permissions, camera, location, and many other things won't work.**

[serve-cli]: https://www.npmjs.com/package/serve

---

## [AWS Amplify Console](https://console.amplify.aws)

The AWS Amplify Console provides a Git-based workflow for continuously deploying and hosting full-stack serverless web apps. Amplify deploys your PWA from a repository instead of from your computer. In this guide, we'll use a GitHub repository. Before starting, [create a new repo on GitHub](https://github.com/new).

1. Add the [amplify-explicit.yml](https://github.com/expo/amplify-demo/blob/master/amplify-explicit.yml) file to the root of your repo.

2. Push your local Expo project to your GitHub repository. If you haven't pushed to GitHub yet, follow [GitHub's guide to add an existing project to GitHub](https://help.github.com/en/articles/adding-an-existing-project-to-github-using-the-command-line).

3. Login to the [Amplify Console](https://console.aws.amazon.com/amplify/home) and choose **Get started** under **Deploy**. Grant Amplify permission to read from your GitHub account or organization that owns your repo.

4. The Amplify Console will detect that the `amplify.yml` file is in your repo. Choose **Next**.

5. Review your settings and choose **Save and deploy**. Your app will now be deployed to a `https://branchname.xxxxxx.amplifyapp.com` URL.

## [Vercel](https://vercel.com/)

Vercel has a single-command zero-config deployment flow. You can use `vercel` to deploy your app for free!

> For more information on unlimited hosting, check out their [pricing](https://vercel.com/pricing).

1. [Install the Vercel CLI](https://vercel.com/download).

2. Build your Expo web app with `expo build:web`.

3. To deploy:

- Run `cd web-build`
- Run `vercel`
- You should see a URL that you can use to view your project online.

Paste that URL into your browser when the build is complete, and you will see your deployed app!

## [Surge](https://surge.sh/)

Install the Surge CLI if you haven’t already by running `npm install -g surge`.
Run the `surge` command, then promptly log in or create a new account.

When asked about the project path, make sure to specify the `web-build` folder, for example:

```sh
project path: /path/to/expo-project/web-build
```

> To support routers that use the HTML 5 `pushState` API, you'll need to rename the `web-build/index.html` to `web/200.html` before deploying.

## [Netlify](https://www.netlify.com/)

### Manual deployment with the Netlify CDN

```sh
npm install netlify-cli -g
netlify deploy
```

Choose `web-build` as the path to deploy.

### Continuous delivery

With this setup Netlify will build and deploy when you push to git or open a new pull request:

1. [Start a new Netlify project](https://app.netlify.com/signup)
2. Pick your Git hosting service and select your repository
3. Click `Build your site`

## [GitHub Pages](https://pages.github.com/)

> We'll use `yarn` but you can use `npm` if you want.

Before starting, be sure to [create a new repo on GitHub](https://github.com/new)

**TL;DR:**

Run the following in your root dir:

```sh
git init
git remote add origin <YOUR_GITHUB_PAGES_URL>
yarn add -D gh-pages
```

Add the following to your `package.json`:

```js
/* package.json */
{
    "homepage": "http://evanbacon.github.io/expo-gh-pages",
    "scripts": {
        "deploy": "gh-pages -d web-build",
        "predeploy": "expo build:web"
    }
}
```

Finally deploy with:

```sh
yarn deploy
```

---

Here are the formal instructions for deploying to GitHub Pages:

1. **Initialize a git repo**

- This is probably already done, but if not then you'll want to run `git init` and set the remote.

  ```
  $ git init
  Initialized empty Git repository in /path/to/expo-gh-pages/.git/
  ```

2. **Add the GitHub repository as a "remote" in your local git repository**

   ```
   $ git remote add origin https://github.com/evanbacon/expo-gh-pages.git
   ```

   - This will make it so the `gh-pages` package knows where you want it to deploy your app.
   - It will also make it so git knows where you want it to push your source code (i.e. the commits on your `master` branch).

3. **Install the `gh-pages` package as a "dev-dependency" of the app**

   ```sh
   yarn add -D gh-pages
   ```

4. **Configure your `package.json` for web hosting**

   - At the top level, add a `homepage` property. Set it's value to the string `http://{username on github, without the curly brackets}.github.io/{repo-name}`. For example: If my GitHub name is `evanbacon` and my GitHub repository is `expo-gh-pages`, I'll asign the following:

   ```js
   /* ... */
   "homepage": "http://evanbacon.github.io/expo-gh-pages"
   ```

   - In the existing `scripts` property, add a `predeploy` property and a `deploy` property, each having the values shown below:

   ```js
   "scripts": {
     /* ... */
     "deploy": "gh-pages -d web-build",
     "predeploy": "expo build:web"
   }
   ```

   > `predeploy` is automatically run before `deploy`.

5. **Generate a _production build_ of your app, and deploy it to GitHub Pages.** (2 minutes)

   ```
   $ yarn deploy
   ```

   - Your web app is now available at the URL you set as `homepage` in your `package.json`.

   > When you publish code to `gh-pages`, it will create and push the code to a branch in your repo called `gh-pages`. This branch will have your built code but not your development source code.

## [Firebase Hosting](https://console.firebase.google.com/)

### Setup Firebase

- Create a firebase project with the [Firebase Console](https://console.firebase.google.com).

- Install the Firebase CLI if you haven’t already by following these [instructions](https://firebase.google.com/docs/hosting).
- Run the `firebase login` command, then promptly log in.
- Run the `firebase init` command, select your project and hosting.

- When asked about the public path, make sure to specify the `web-build` folder.

- Answer 'Configure as a single-page app (rewrite all urls to /index.html)' with 'Yes'.

### Update package.json

In the existing `scripts` property, add a `predeploy` property and a `deploy` property, each having the values shown below:

```js
"scripts": {
  /* ... */
  "predeploy": "expo build:web",
  "deploy-hosting": "npm run predeploy && firebase deploy --only hosting",
}
```

Run the `npm run deploy-hosting` command to deploy.

Open the url from the console output to check your deployment, e.g. https://PROJECTNAME.firebaseapp.com

In case you want to change the header for hosting add the following config in `hosting` section in firebase.json:

```js
  "hosting": [
    {
      /* ... */
 "headers": [
        {
          "source": "/**",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "no-cache, no-store, must-revalidate"
            }
          ]
        },
        {
          "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css|eot|otf|ttf|ttc|woff|woff2|font.css)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "max-age=604800"
            }
          ]
        }
      ],
    }
  ]
```

## [Heroku hosting](https://dashboard.heroku.com/apps/)

### static.json

- Add a `static.json` to select the web-build folder:

```js
{
  "root": "web-build/",
  "clean_urls": false
}
```

- To enable client side routing add `"routes"`:

```js
{
  "root": "web-build/",
  "clean_urls": false,
  "routes": {
    "/**": "index.html"
  }
}
```

### Connect your app with Heroku

- Create a new Heroku app

- Connect your app via Heroku CLI or Github to deploy it


### Heroku buildpack static

- Add the `heroku-buildpack-static`. Go to Settings click on `Add buildpack` and paste [https://github.com/hone/heroku-buildpack-static](https://github.com/hone/heroku-buildpack-static) into the search bar and click `Save changes`.

> Remove all other buildpacks if there are.

- Deploy your app
