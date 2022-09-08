# Burlap

A Desktop app built with Tauri and React. The backend is built with Rust for optimal memory usage and speed. This app is built with speed in mind; the [react-query](https://tanstack.com/query/v4) library was used to allow for efficient caching and refetching of data. All the necessary client side code is stored on your computer to allow for quick load times.

## How to setup the beta

There is currently no available build to download so one must compile it on their own. The steps to do so are below:

**Download the source code by running**

```bash
git clone https://github.com/BlueZeeKing/burlap.git
cd burlap
```

**Download the necessary dependencies**

```bash
pnpm i
# or 
npm i
```

**Run the project in dev mod**

```bash
pnpm run tauri dev
# or 
npm run tauri dev
```

**Build the project in production mod**

```bash
pnpm run tauri build
# or 
npm run tauri build
```

**The bundle can than be found in `src-tauri/target/release/bundle`**