/**
 * STUDY MATERIAL - SPFx 1.24 preview. Not guaranteed to compile against your
 * scaffolded beta; read for the pattern, then compare to your generated file.
 *
 * This file defines the TOOL PARAMETER SCHEMA using Zod.
 * ---------------------------------------------------------------------------
 * Why Zod: the Copilot host validates the arguments the model passes to your
 * tool at runtime, AND the schema tells the model what shape to produce.
 * Keep this in sync with:
 *   - the "greet" function.parameters in ../../copilot/ai-plugin.json
 *   - the "tools[].propertiesSchema" reference in the component .manifest.json
 *
 * Rule of thumb: model the schema as TIGHTLY as possible. Narrow types and
 * good .describe() text make the model pass correct arguments. Prefer enums
 * over free-form strings whenever the value is constrained.
 */

import { z } from 'zod';

/**
 * The parameters Copilot will pass when it invokes the `greet` tool.
 * The variable name here (schema export) is what the manifest's
 * `propertiesSchema: "HelloAgentCopilotComponentProperties"` resolves to.
 */
export const HelloAgentCopilotComponentProperties = z.object({
  /** The user's display name to greet. Required. */
  name: z
    .string()
    .min(1)
    .describe("The user's display name to greet, e.g. 'Adele'."),

  /**
   * When true, the component asks the host to expand to full-screen -
   * the "open the full app" experience. Optional, defaults to false.
   */
  openFullscreen: z
    .boolean()
    .optional()
    .describe(
      "If true, the component requests full-screen display instead of inline."
    ),
});

/** Handy inferred TS type for use inside the component. */
export type HelloAgentToolProps = z.infer<
  typeof HelloAgentCopilotComponentProperties
>;
