Working branch
  remotes/origin/roby/ui-io-bug-fixes

Frontend diagram in R2 Shared/Projects/R2 Controller/UI/Frontend_system_diagram.io

Frontend (nextjs documentation structure)

* dashboard/src/app --> where all the pages are. Only dashboard implemented right now
* layout.tsx --> can have pages added there
* 
* lib/components/ 
    * server_components -> static render on server
    * client_component -> anything with hooks and dynamically updates
    * usecontext -> like usestate but can be shared between different values --> shares the dashboard_context.ts
    * example: IODisplay


# TODO:
* some stuff in database not working --> easiest for Roby to fix
* Datacharts page --> import from motion plot --> use the same containers