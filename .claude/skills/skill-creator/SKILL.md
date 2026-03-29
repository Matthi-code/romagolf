---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific domains or tasks—they transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific file formats or APIs
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex and repetitive tasks

### Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

## SKILL.md Structure

### Frontmatter (Required)

```yaml
---
name: skill-name
description: Clear description of what this skill does and when to use it.
---
```

**Metadata Quality:** The `name` and `description` determine when Claude will use the skill. Be specific about what the skill does and when to use it. Use third-person (e.g. "This skill should be used when..." instead of "Use this skill when...").

### Body (Required)

The markdown content contains instructions, examples, and guidelines that Claude follows.

## Bundled Resources (Optional)

### Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks requiring deterministic reliability.

- **When to include**: Same code being rewritten repeatedly
- **Example**: `scripts/rotate_pdf.py` for PDF rotation tasks
- **Benefits**: Token efficient, deterministic, may execute without loading into context

### References (`references/`)

Documentation loaded as needed into context.

- **When to include**: Documentation Claude should reference while working
- **Examples**: `references/schema.md` for database schemas, `references/api_docs.md` for API specs
- **Best practice**: Keep SKILL.md lean; move detailed material to references files

### Assets (`assets/`)

Files used in output (not loaded into context).

- **When to include**: Files used in final output
- **Examples**: `assets/logo.png`, `assets/template.pptx`, `assets/boilerplate/`
- **Use cases**: Templates, images, icons, boilerplate code, fonts

## Progressive Disclosure Design Principle

Skills use a three-level loading system:

| Level | Content | Size | When Loaded |
|-------|---------|------|-------------|
| 1 | Metadata (name + description) | ~100 words | Always |
| 2 | SKILL.md body | <5k words | When skill triggers |
| 3 | Bundled resources | Unlimited* | As needed |

*Scripts can execute without loading into context window.

## Skill Creation Process

### Step 1: Understand with Concrete Examples

Ask clarifying questions:
- "What functionality should this skill support?"
- "Can you give examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

### Step 2: Plan Reusable Contents

Analyze each example by:
1. Considering how to execute from scratch
2. Identifying helpful scripts, references, and assets

**Example analyses:**

| Skill | User Query | Analysis | Resource |
|-------|------------|----------|----------|
| pdf-editor | "Rotate this PDF" | Same code rewritten each time | `scripts/rotate_pdf.py` |
| webapp-builder | "Build me a todo app" | Same boilerplate each time | `assets/hello-world/` |
| big-query | "How many users logged in?" | Re-discovering schemas each time | `references/schema.md` |

### Step 3: Initialize the Skill

Create skill directory structure:

```
my-skill/
├── SKILL.md
├── scripts/       (optional)
├── references/    (optional)
└── assets/        (optional)
```

### Step 4: Edit the Skill

**Writing Style:** Use **imperative/infinitive form** (verb-first instructions), not second person.

✅ Good: "To accomplish X, do Y"
❌ Bad: "You should do X" or "If you need to do X"

**Complete SKILL.md by answering:**
1. What is the purpose of the skill? (few sentences)
2. When should the skill be used?
3. How should Claude use the skill? (reference all bundled resources)

### Step 5: Validate and Package

Before distributing, validate:
- YAML frontmatter format and required fields
- Skill naming conventions
- Description completeness and quality
- File organization and resource references

### Step 6: Iterate

After testing:
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Update SKILL.md or bundled resources
4. Test again

## SKILL.md Template

```markdown
---
name: my-skill-name
description: A clear description of what this skill does and when to use it. This skill should be used when...
---

# My Skill Name

Brief description of the skill's purpose.

## When to Use This Skill

- Use case 1
- Use case 2
- Use case 3

## Instructions

[Detailed instructions for Claude on how to execute this skill]

## Examples

[Real-world examples showing the skill in action]

## Resources

Reference bundled resources:
- `scripts/example.py` - Description
- `references/docs.md` - Description
- `assets/template/` - Description
```

## Best Practices

1. **Be Specific in Description** — Determines when Claude activates the skill
2. **Use Imperative Style** — "Do X" not "You should do X"
3. **Keep SKILL.md Lean** — Move details to references/
4. **Progressive Disclosure** — Load only what's needed
5. **Avoid Duplication** — Info lives in SKILL.md OR references, not both
6. **Test Iteratively** — Use skill, identify gaps, improve

## Common Patterns

### Domain Expertise Skill
```
company-policies/
├── SKILL.md           # Overview + when to use
└── references/
    ├── hr-policies.md
    ├── security.md
    └── expense-rules.md
```

### Tool Integration Skill
```
pdf-editor/
├── SKILL.md           # Instructions for PDF operations
└── scripts/
    ├── rotate_pdf.py
    ├── merge_pdfs.py
    └── extract_text.py
```

### Template-Based Skill
```
brand-guidelines/
├── SKILL.md           # Brand rules + usage
└── assets/
    ├── logo.png
    ├── fonts/
    └── templates/
```
