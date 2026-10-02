# 06 · Declarative agent JSON reference

> **Status:** Declarative agent manifest **v1.8** is the current latest (there is no v1.9). The companion API plugin manifest is **v2.4**. These schemas can change, so always validate against the live schema URL.

This is the full property list for the two JSON files that define your agent's brain and its actions. Use it as a lookup while you edit `copilot/declarativeAgent.json` and `copilot/ai-plugin.json`. The files themselves are explained in [03-project-anatomy.md](03-project-anatomy.md).

## Schema URLs and version strings

| Manifest | `$schema` URL | Version field |
|----------|---------------|---------------|
| Declarative agent | `https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.8/schema.json` | `"version": "v1.8"` |
| API plugin | `https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json` | `"schema_version": "v2.4"` |

Point your editor at these URLs to get validation and IntelliSense as you type.

---

## Part 1 - `declarativeAgent.json` (v1.8)

### Root properties

| Property | Type | Required | Limits and notes |
|----------|------|----------|------------------|
| `$schema` | string (URL) | Conventional | The v1.8 schema URL above. Enables validation. |
| `version` | string | **Yes** | Must be `v1.8`. |
| `id` | string | No | An identifier for the manifest. |
| `name` | string | **Yes** | 1 to 100 characters. Can be localized. |
| `description` | string | **Yes** | 1 to 1,000 characters. Can be localized. |
| `instructions` | string | **Yes** | Up to 8,000 characters. The behaviour, rules, and guidance for the model. |
| `capabilities` | array | No | The built-in knowledge and skill capabilities. At most one of each type. See below. |
| `conversation_starters` | array | No | Up to 12 example prompts shown to the user. |
| `actions` | array | No | 1 to 10 plugin references that give the agent callable actions. |
| `behavior_overrides` | object | No | Tunes suggestions, model-knowledge use, and default response mode. |
| `disclaimer` | object | No | Text shown at the start of a conversation. Has one property, `text` (up to 500 chars). |
| `sensitivity_label` | object | No | A Microsoft Purview label id. Applies to embedded files only, and is not yet enabled. |
| `editorial_answers` | object | No | Predefined question and answer pairs matched by similarity. |
| `worker_agents` | array | No (preview) | Other declarative agents this one can call. |
| `user_overrides` | array | No | Capabilities the user can switch on or off in the UI. |

### `capabilities` - the full list

Each entry is an object identified by its `name`. You may include at most one of each type.

| Capability `name` | Sub-properties | What it grounds or enables |
|-------------------|----------------|----------------------------|
| `WebSearch` | `sites` (array, up to 4 Site objects with a `url`) | Public web search. Omit `sites` to search the whole web; add sites to scope it. |
| `OneDriveAndSharePoint` | `items_by_url` (array of `{url}`), `items_by_sharepoint_ids` (array of `{site_id, web_id, list_id, unique_id, ...}`) | Grounds on SharePoint and OneDrive files, folders, or sites. Omit both to use everything the user can access. |
| `GraphConnectors` | `connections` (array of Connection objects) | Grounds on Copilot (Graph) connector content. Omit `connections` to use all connectors. |
| `GraphicArt` | none | Image and art generation. |
| `CodeInterpreter` | none | Generates and runs Python for data tasks. |
| `Dataverse` | `knowledge_sources` (array with `host_name`, `skill`, `tables`) | Grounds on Dataverse tables. |
| `TeamsMessages` | `urls` (array of up to 5 Teams URL objects) | Grounds on Teams channels, meetings, and chats. |
| `Email` | `shared_mailbox`, `group_mailboxes` (max 25), `folders` | Read-only search over mail. |
| `EmailActions` | none | Mail write actions (new in 1.8): triage, supervised send, delete, inbox rules, auto-reply, folder management. |
| `People` | `include_related_content` (boolean, default false) | Grounds on people in the org, optionally including shared content. |
| `Meetings` | `items_by_id` (array of up to 5 `{id, is_series}`) | Grounds on meetings. Omit to use all. |
| `MeetingActions` | none | Meeting actions (new in 1.8): scheduling, time-finding polls, time insights. |
| `ScenarioModels` | `models` (array of `{id}`, required) | Task-specific models. |
| `EmbeddedKnowledge` | `files` (array of up to 10 `{file}`, required) | Bundled files as knowledge. Max 1 MB each. Types: doc, docx, ppt, pptx, xls, xlsx, txt, pdf. |

**Connection object** (inside `GraphConnectors`): `connection_id` (required), `additional_search_terms`, and several item filters (`items_by_external_id`, `items_by_external_url`, `items_by_path`, `items_by_container_name`, `items_by_container_url`).

### `conversation_starters`

Each object is a suggested prompt.

| Property | Type | Required | Notes |
|----------|------|----------|-------|
| `text` | string | **Yes** | The prompt text. Can be localized. |
| `title` | string | No | A short label. Can be localized. |
| `depends_on` | array | No | Show the starter only when a named capability is present. Each entry is `{name: "capabilities", id: "Email"}` style. |

### `actions`

An action links the agent to a plugin. An entry is either a reference to a plugin file, or a full inlined plugin object.

| Property | Type | Required | Notes |
|----------|------|----------|-------|
| `id` | string | **Yes** | A unique action id. Can be a GUID. |
| `file` | string | **Yes** | Path to the API plugin manifest (`ai-plugin.json`) for this action. |

This `id` plus `file` pair is the bridge between the agent and its plugin. The plugin's `functions` and `runtimes` define what actually runs.

### `behavior_overrides`

| Property | Type | Notes |
|----------|------|-------|
| `suggestions` | object | `{disabled: boolean}` (default false). |
| `special_instructions` | object | `{discourage_model_knowledge: boolean}` (default false). Push the agent toward your knowledge over the model's own. |
| `default_response_mode` | string | `Auto` (default), `Quick response`, or `Think deeper`. The user can still override it. |

### Other root objects (brief)

- **`user_overrides`**: each entry is `{path, allowed_actions}`. `path` is a JSONPath to a capability, and `allowed_actions` supports the value `remove`, which shows an on or off toggle.
- **`editorial_answers`**: either a `url` to an answers document, or an inline `answers` array (up to 300) of `{question, answer, similarity_thresholds}`.
- **`worker_agents`** (preview): each entry has `id` (the title id of the app that holds the other agent). Some docs mention a `file` alternative, but it is not confirmed in the v1.8 property tables.

---

## Part 2 - `ai-plugin.json` (API plugin, v2.4)

### Root properties

| Property | Type | Required | Notes |
|----------|------|----------|-------|
| `$schema` | string (URL) | Conventional | The v2.4 plugin schema URL. |
| `schema_version` | string | **Yes** | Must be `v2.4`. |
| `name_for_human` | string | **Yes** | Short display name. Keep it under 20 characters. |
| `namespace` | string | **Yes** | Letters and numbers only. Prevents function-name clashes between plugins. |
| `description_for_human` | string | **Yes** | Human-readable description. |
| `description_for_model` | string | No | Description given to the model. |
| `functions` | array | No | The callable operations. If omitted with an OpenAPI runtime, they are inferred from the spec. |
| `runtimes` | array | No | How the functions run (OpenAPI, local add-in, or MCP server). |
| `capabilities` | object | No | Plugin-level extras, such as `conversation_starters`. |
| `logo_url`, `contact_email`, `legal_info_url`, `privacy_policy_url` | string | No | Metadata. |

### `functions[]`

| Property | Type | Notes |
|----------|------|-------|
| `name` | string (required) | Letters, numbers, underscore. For OpenAPI it must match an `operationId`. |
| `description` | string | Model-facing description. |
| `parameters` | object | A JSON-schema-like shape: `type: "object"`, `properties`, `required`. |
| `returns` | object | Either `{type: "string", description}` or a rich return that `$ref`s a rich-response schema. |
| `states` | object | Per-orchestrator-state config: `reasoning`, `responding`, `disengaging`. |
| `capabilities` | object | `confirmation` (None or AdaptiveCard), `response_semantics` (how results render, including an Adaptive Card), and `security_info` (`data_handling` values such as `GetPublicData`, `DataExport`). |

### `runtimes[]`

| Property | Type | Notes |
|----------|------|-------|
| `type` | string (required) | `OpenApi`, `LocalPlugin`, or `RemoteMCPServer` (MCP is new in v2.4). |
| `auth` | object (required) | `{type}` is one of `None`, `OAuthPluginVault`, `ApiKeyPluginVault`, with an optional `reference_id`. |
| `run_for_functions` | array | Which functions this runtime serves. Wildcards allowed. No two runtimes may claim the same function. |
| `spec` | object (required) | Runtime-specific connection info. For OpenAPI it is `{url}` or an inline `api_description`. For MCP it is `{url, mcp_tool_description}`. |

---

## Version history (what changed)

**Declarative agent:**
- **1.5** added the `Meetings` capability.
- **1.6** added embedded knowledge, meeting scoping (`items_by_id`), and `worker_agents`.
- **1.7** added `editorial_answers` and the `default_response_mode` behaviour override.
- **1.8** added the `EmailActions` and `MeetingActions` capabilities. There is no 1.9.

**API plugin:**
- **2.4** added MCP server support (the `RemoteMCPServer` runtime type and MCP spec object), external file references for Adaptive Card templates, and refined confirmation behaviour for OpenAPI GET actions.

---

## Validate before you ship

The SPFx build does not yet validate the agent definition, so validate the packaged agent yourself with the Microsoft 365 Agents Toolkit CLI:

```powershell
atk validate --package-file agent-file.zip
```

More tooling and helpers are in [07-skills-and-tooling.md](07-skills-and-tooling.md).

## Sources

- Declarative agent schema 1.8: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.8
- API plugin schema 2.4: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-manifest-2.4
- What's new for M365 Copilot developers: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/whats-new
- Schema source repo: https://github.com/microsoft/AgentSchema
