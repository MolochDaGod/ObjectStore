# Local build and launch

Canonical source: `C:\grudgegit\ObjectStore`. Build workspace: `D:\grudgegit\ObjectStore\<component>\<runID>`. Completed outputs: `E:\grudgegit\ObjectStore\<component>\<runID>`.

Use `Project-Console.ps1` for independent component build/launch windows, installer selection and administrator cleanup. Use `Build-Workspace.ps1 -Plan` to inspect without building, or `-Component <id>` to build one component. A build stages current source and dependencies on D; it never compiles in C. Successful output receipts and runnable dependencies are published to E. Failed builds never advance latest.

Each build offers to launch the completed program. Windows installers have an assisted finish page with a launch checkbox. Latest launch never triggers a build. Component and dependency details are in `.workspace-build.json`. Native Apple compilation requires macOS/Xcode; Windows can export its source kit.

Cleanup terminates processes owned by this project and removes managed D build runs. It preserves C source, E outputs and persistent data outside the grouped D project folder. UAC is requested only when the cleanup option is chosen.

This workflow is opt-in and Windows-only: run `npm run workspace:build` or `npm run workspace:menu`. The normal `build` and `build:*` scripts in package.json are unchanged and run on any OS (CI, Vercel). `.workspace-build.json`, `.storage/profile.json` and `.storage/device.json` are per-machine files and are gitignored.
