// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { ReactElement, useContext } from "react";

import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import DashboardContext from "@/lib/models/dashboard_context";

export function ParameterDataTable(props: { className?: string }) {
  const { context } = useContext(DashboardContext);

  if (!context.latest_document.document_valid) {
    return <LoadingIndicator />;
  }

  const table_entries = () => {
    const table_entries: Array<ReactElement> = [];
    // let row_id = 0;
    for (const component_name in context.latest_document.component_signals) {
      const hardware_component =
        context.latest_document.component_signals[component_name];

      for (const parameter_name in hardware_component) {
        const parameter = hardware_component[parameter_name];

        const formatted_value =
          typeof parameter.value === "boolean"
            ? parameter.value.toString()
            : parameter.value.toFixed(3);

        const pid_tag = context.configuration.GetPIDTag(component_name);
        const units = context.configuration.GetComponentParameterUnits(
          component_name,
          parameter_name,
        );

        table_entries.push(
          <tr
            key={component_name + "_" + parameter_name}
            className="even:bg-gray-50 odd:bg-white"
          >
            <td>
              {component_name}_{parameter_name}
            </td>
            <td>{pid_tag}</td>
            <td>{formatted_value}</td>
            <td>{units}</td>
          </tr>,
        );
        // row_id++;
      }
    }

    return table_entries.sort((entry1, entry2) => {
      const entry1_key: string = entry1.key?.toString() ?? "";
      const entry2_key: string = entry2.key?.toString() ?? "";

      if (entry1_key > entry2_key) {
        return 1;
      }

      if (entry1_key < entry2_key) {
        return -1;
      }

      return 0;
    });
  };

  return (
    <div className="flex flex-col h-full ">
      <table
        className={`bp4-html-table bp4-html-table-striped ${
          props.className ?? ""
        }`}
      >
        <thead>
          <tr>
            <th className="dark:text-r2-white">Parameter Name</th>
            <th className="text-left dark:text-r2-white">P&ID Tag</th>
            <th className="text-left dark:text-r2-white">Value</th>
            <th className="text-left dark:text-r2-white">Units</th>
          </tr>
        </thead>
        <tbody>{table_entries()}</tbody>
        <tfoot>
          <tr>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
