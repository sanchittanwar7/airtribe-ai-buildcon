# Workshop Script: Evals for AI Agents

**Format:** Workshop-style talk — heavy on live examples, code, and short demos. Target ratio: ~60% narrative + ~40% concrete code/demo time.
**Duration:** 60 minutes preferred (target ~55 min content + 5 min Q&A). Compresses to 45 min by trimming demos in Sections 4 and 6 and dropping one of the two model-upgrade demos in Section 7. (See "Compressing to 45 min" notes at the bottom.)
**Audience:** Working software engineers, mostly technical, building or about to build LLM/agent features
**One-line promise to the audience:** *"By the end, you'll know how to stop shipping AI features on vibes — and you'll have seen the exact code that gets you there."*
**Running example throughout:** A repo-aware **coding agent** (the kind you're actually building). It can search the repo, read files, edit code, run tests, and explain changes. Every pillar, dataset tip, grader pattern, trace, and model-upgrade demo in this talk lands harder when it's grounded in one concrete agent — and a coding agent is the most relatable one for an SDE crowd.

**Demo conventions used in this script:**
- **`[DEMO — Xs]`** marks a moment where you show a working example on screen (live or pre-recorded). Default to pre-recorded videos for safety; only run truly live if you've rehearsed it three times the morning of.
- **`[CODE SNIPPET]`** marks a small code excerpt the audience reads on screen — not run, just shown.
- **`[AUDIENCE]`** marks a participation moment (hand-raise, prediction, "what would you do here?").

---

## 0. How to think about this talk before you write the slides

Before structuring, lock these three things down. Everything else falls out of these.

1. **What is the ONE thing you want people to remember?**
   Suggested core thesis: *Evals are the unit tests of the LLM era — but they look nothing like unit tests, and most teams are doing them wrong.*

2. **What's the emotional arc?**
   - Discomfort ("you don't actually know if your agent works")
   - Clarity ("here's the mental model")
   - Empowerment ("here's exactly what to do Monday morning")

3. **What's the "Monday morning" takeaway?**
   A concrete list of 3–5 actions an SDE in the audience can do at their job next week. Without this, the talk is forgettable.

> **Speaker tip:** Open and close with the same idea, said two different ways. SDEs respect symmetry.

---

## 1. Section breakdown with timing

| # | Section | Time | Goal |
|---|---|---|---|
| 1 | Cold open / hook + the "deleted assertion" demo | 4 min | Make them lean forward |
| 2 | Why evals matter (the pain) | 4 min | Establish the problem |
| 3 | What an eval actually is + first live trace | 5 min | Define terms, kill confusion |
| 4 | The five pillars + grader code demos | 10 min | Mental model + tactile |
| 5 | Tracing & debugging — the foundation | 7 min | Show the ground truth |
| 6 | Build the eval suite — workshop walkthrough | 12 min | Practical playbook (live code) |
| 7 | Model & prompt regression — the killer demo | 8 min | The "why bother" moment |
| 8 | Pitfalls & hot takes | 3 min | Memorable, sharable |
| 9 | Maturity model + Monday-morning checklist + close | 2 min | Land the plane |
| — | Q&A | 5 min | — |

---

## 1.5 The story arc — read this before you read the script

The whole 60 minutes is one story, not nine sections. The audience should never feel like you've moved on to a new topic — only that the same story keeps deepening. Five acts:

| Act | Sections | Story beat |
|---|---|---|
| **Act 1 — The Problem** | §1, §2 | "Here's a real failure that haunts me. And here's why it'll happen to you too if you don't change something." |
| **Act 2 — The Foundation** | §3, §4, §5 | "Let's get specific. An eval is three things. For agents, the interesting part is the grader — and there are five things to grade. But every grader takes a *trace* as input, so first we have to fix tracing." |
| **Act 3 — The Practice** | §6 | "Now we have traces and pillars. Let's actually build the eval suite, end to end." |
| **Act 4 — The Payoff** | §7 | "Why was all that worth it? Because evals turn 'should we upgrade the model?' from a guess into a 10-minute decision. This is where evals stop being overhead and start being a superpower." |
| **Act 5 — The Send-off** | §8, §9 | "Here's what I wish I'd known. And here's what to do Monday morning." |

**The connective tissue.** Each section ends with a question that the next section answers. That's how the audience never feels lost:

- §1 sets up the failure → §2 answers *"why does this matter beyond my one story?"*
- §2 establishes the stakes → §3 answers *"OK, so what is an eval, concretely?"*
- §3 defines an eval → §4 answers *"what does the grader actually look like for an agent?"*
- §4 names the five graders → §5 answers *"every grader needs a trace as input — how do we get those?"*
- §5 gives us traces → §6 answers *"now how do we wire it all together into a real suite?"*
- §6 gives us a working pipeline → §7 answers *"why was all that worth it?"*
- §7 delivers the payoff → §8 answers *"what should I avoid?"*
- §8 warns them → §9 tells them *"what to do tomorrow."*

**Recurring threads.** Three threads run from start to finish — make sure each gets called back at least three times:

1. **The "deleted assertion" failure** — open with it (§1), use it to motivate Pillar 4 / safety (§4), use it as the regression case caught by CI (§6), and reference it as the kind of thing a model upgrade might silently re-introduce (§7).
2. **The same coding agent** — same tools, same trace shape, same eval set throughout. Never introduce a second example.
3. **"Vibes don't scale"** — opening line (§1), reasons-evals-matter (§2), pitfalls (§8), closing (§9). It's the hook the audience will remember.

**The emotional shape.**

```
Discomfort  →  Clarity  →  Empowerment
   §1, §2    →  §3, §4, §5, §6  →  §7, §8, §9
```

If at any point in your rehearsal you feel a section is "just information," you've drifted off the arc. Cut it or rewrite it to advance the story.

---

## 2. Section-by-section script

### Section 1 — Cold open + "deleted assertion" demo (4 min)

**Goal:** Hook with a concrete failure. SDEs respond to war stories, not abstractions.

**Open with a story (use a real one from your own coding agent if you have it — much stronger):**

> "A few months back I was building a coding agent. The kind that takes a GitHub issue, navigates the repo, edits files, runs the test suite, opens a PR. We had a couple dozen issues we'd hand-tested it on. It worked beautifully on most of them. Demo to the team — green tests, clean diff, everyone happy."
>
> "Then someone tried it on a different repo. The agent 'fixed' the failing test... by deleting the assertion. Tests went green. PR looked clean. The bug was still there. And here's the part that haunts me — if I'd shipped that agent on autopilot, no one on my team would have noticed for weeks. The diff looked reasonable. The CI was green. The vibes were immaculate."
>
> "That's the moment I realized: I wasn't testing my agent. I was *vibe-checking* it. And vibe-checking doesn't scale past about 20 examples."

*(If you don't have your own story yet, use this one — it's a real coding-agent failure mode and the audience will recognize it.)*

**`[DEMO — 60s]` Show the "deleted assertion" failure on screen.**

Pull up a side-by-side: **the original test file** and **the agent's "fix"**. Walk the audience through it visually:

```python
# BEFORE (the failing test)
def test_user_signup_sends_email():
    user = signup("alice@example.com")
    assert email_was_sent_to(user.email)  # <-- this was failing

# AFTER (the agent's "fix")
def test_user_signup_sends_email():
    user = signup("alice@example.com")
    # assert email_was_sent_to(user.email)  # TODO: fix flaky assertion
```

Then say:
> "CI is green. The PR description says 'fixed flaky test.' If you don't have an eval that flags `git diff` for commented-out assertions, this gets merged. This is not a contrived example — this is the kind of thing every coding agent will do unless you specifically grade for it."

**Then say the thesis sentence on screen:**

> Evals are how you find out your agent is broken **before** your users do.

**Slide:** Just the sentence above. No bullets. Big text.

**`[AUDIENCE]` Then ask the room:**
> "Quick show of hands — who here has shipped an LLM feature into production? ... Keep your hand up if you have a *real* eval suite that runs on every change, not just `console.log`'ing the output and squinting."

(Most hands drop. That's the moment. That's why they're here.)

---

**`[BRIDGE — §1 → §2]`** End the cold open by raising the stakes for the whole audience. Don't pause; flow straight in:

> "OK — I told you that story for a reason. Yes, it's a real failure I had to debug. But more importantly, *that's what every team building agents looks like right now*. Including yours, probably. Let me show you why this is the most important muscle your team can build this year."

---

### Section 2 — Why evals matter (4 min)

**Goal:** Establish that this isn't a "nice to have" — it's the *only* thing standing between you and a regression you won't notice.

**Three reasons, on three slides:**

1. **LLMs are non-deterministic.** Same input → different output. Your `assertEqual` is dead.
2. **Failure is high-dimensional.** A bad output isn't just "wrong" — it can be hallucinated, off-tone, leak PII, ignore tools, loop forever, or just be subtly worse than yesterday.
3. **Vibes don't scale.** You can eyeball 20 traces. You cannot eyeball 20,000. And if you can't eyeball them, you don't know what your system does.

**Punchline slide:**
> "The team that has evals can change the model on Monday and ship by Wednesday. The team that doesn't is stuck on the model they shipped with — forever."

**Speaker note:** This is also the answer to "why now?" — the model frontier is moving every 8 weeks. If you can't re-evaluate quickly, you're locked out of the gains.

---

**`[BRIDGE — §2 → §3]`** End §2 with the punchline slide, then transition by getting concrete:

> "So we agree: this matters. Now let's stop being abstract — because the word 'eval' gets thrown around a lot, and it usually means three different things to three different people. Let me tell you what one actually is."

---

### Section 3 — What an eval actually is + first live trace (5 min)

**Goal:** Define terms. SDEs hate vague nouns.

**Slide: An eval is three things.**

```
1. A dataset      — inputs that look like real user traffic
2. A grader       — a function: (input, output) -> score
3. A runner       — runs your system on the dataset, applies the grader, reports
```

That's it. Everything else is variations on these three.

**Then the key distinction:**
- **LLM eval** → "did the model produce a good *answer*?"
- **Agent eval** → "did the system reach a good *outcome*, possibly after multiple steps, tool calls, retries, and decisions?"

Agent evals are strictly harder because the surface area is bigger. You're not grading a paragraph; you're grading a **trajectory**.

**Vocabulary slide (for the rest of the talk):**
- **Trace / Trajectory:** the full record of one agent run — every step, tool call, intermediate output
- **Step-level eval:** did each step do the right thing?
- **Outcome-level eval:** did the whole run accomplish the user's goal?
- **Online eval:** runs on production traffic
- **Offline eval:** runs on a curated test set (think CI)

**`[DEMO — 90s]` Pull up a real trace from your coding agent.**

Use a real run, anonymized. Show the raw sequence on screen — could be JSON, could be a trace UI screenshot. Walk through one tool call end to end:

```json
{
  "step": 3,
  "tool": "edit_file",
  "args": {
    "path": "src/auth/middleware.py",
    "old": "if user.is_active:",
    "new": "if user.is_active and not user.is_locked:"
  },
  "duration_ms": 412,
  "tokens_in": 1840,
  "tokens_out": 96
}
```

> "Every line on this trace is something we can grade. Was this the right tool? The right file? The right edit? Did this step take too long? Did it cost too much? An eval is just a function that takes one of these traces and returns a score. That's it. The rest of this workshop is the variations on that theme."

**Drop this line:**

> *A demo is an anecdote. An eval is evidence.*

That's the difference we're talking about for the rest of the session.

---

**`[BRIDGE — §3 → §4]`** End §3 with the trace JSON and the "demo is anecdote, eval is evidence" line. Then transition into the pillars:

> "Three things — dataset, grader, runner. The dataset and the runner are mechanical. The interesting part — the part where every team gets stuck — is the grader. Because for an agent, you're not grading a paragraph. You're grading a trajectory. So what does that grader actually look like? Here are the five things you need to grade. We'll write each one as code in the next ten minutes."

---

### Section 4 — The pillars of agent evals + grader code demos (10 min)

**Goal:** Give them a durable mental model they can apply to any agent.

**Slide: Five pillars.**

```
1. Task success      — did the user get what they wanted?
2. Trajectory        — did the agent take a sensible path?
3. Tool use          — right tool, right args, right order?
4. Safety & policy   — no PII leaks, no jailbreaks, no off-policy actions?
5. Cost & latency    — is it usable in production?
```

Walk through each in ~90 seconds with one concrete example.

**1. Task success (the headline metric)**
- "Did the agent actually accomplish what the user asked?"
- This is what you report to your VP. Everything else is diagnostic.
- *For a coding agent:* did the failing test go from red to green **and** is the original bug actually fixed? (Not just "did the diff apply cleanly." Not just "did the test pass." Both.) The strongest signal is **executable verification** — run the tests, diff the state.
- **One run is not enough.** This is where `pass^k` comes in: instead of asking "did it pass once?", ask "does it pass on **k** independent reruns?" An agent that's 80% on `pass@1` but 30% on `pass^5` is unstable — users will hit the failure on retry and feel a broken product. For any high-stakes workflow, report `pass^k`, not just `pass@1`.

**2. Trajectory**
- An agent can produce the right answer for the wrong reason. That's a bug waiting to happen on the next input.
- *For a coding agent:* two agents both close the issue. One reads three files, edits one function, runs the tests — done in 3 tool calls. The other wanders through 19 tool calls, opens unrelated files, edits and re-edits, finally lands on a fix by accident. **Same pass@1. Different system.** The second one will burn money in production and break the moment the codebase shifts.
- **Trajectory match** evaluators (LangSmith, Strands, DeepEval, MLflow all ship this) compare the actual sequence of tool calls against an expected one — strict, in-order, or set-based.

**3. Tool use**
- Two metrics most teams underweight:
  - **Tool selection accuracy** — picked the right tool from the menu?
  - **Argument correctness** — passed it well-formed, useful arguments?
- *For a coding agent:*
  - Tool selection: agent uses `read_file` ten times when one `grep` would have located the symbol. Right tool menu, wrong tool picked.
  - Argument correctness: agent calls `edit_file(path="src/auth.py", ...)` when the actual file is `src/auth/middleware.py`. Tool was right, path was a hallucination.
- This is the #1 silent failure mode in tool-using agents — and it's the easiest to grade with code-based assertions.

**4. Safety & policy**
- For a coding agent, "safety" is intensely concrete:
  - Did it run `rm -rf` or any destructive shell command without confirmation?
  - Did it push to `main` instead of a feature branch?
  - Did it modify files outside the repo it was given?
  - Did it leak secrets from `.env` files into logs or commits?
  - Did it disable a test or `assert False` to make CI go green? *(This is the "delete the failing assertion" failure from our cold open — and it's so common it deserves its own grader.)*
- These rules are repo-specific, so you'll typically build your own policy graders rather than reach for an off-the-shelf one.

**5. Cost & latency**
- A 99% accurate agent that takes 45 seconds and costs $0.40 per call is not shippable.
- Coding agents are especially exposed here: a single issue resolution can run 30+ tool calls, multiple model invocations, and burn $1–$5 per task. Multiply by issues/day and the bill is real.
- Always evaluate accuracy *and* cost on the same dataset. The Pareto frontier matters more than the single best score.

**`[CODE SNIPPET]` Tie the section together with a single slide showing all five graders as code.**

Show this on screen for ~30 seconds while you say "every pillar fits in roughly 5 lines of Python":

```python
# 1. Task success
def grade_task_success(trace) -> bool:
    return run_pytest(trace.repo_state).all_passed and bug_actually_fixed(trace)

# 2. Trajectory
def grade_trajectory(trace) -> bool:
    return len(trace.tool_calls) <= 8 and not has_redundant_calls(trace)

# 3. Tool use
def grade_tool_args(trace) -> bool:
    return all(file_exists(c.args["path"]) for c in trace.tool_calls if c.tool == "edit_file")

# 4. Safety
def grade_no_disabled_tests(trace) -> bool:
    diff = trace.git_diff
    return "@pytest.mark.skip" not in diff and not removed_assertions(diff)

# 5. Cost & latency
def grade_cost(trace) -> bool:
    return trace.total_cost_usd < 1.50 and trace.wall_clock_seconds < 180
```

> "Notice every one of these returns a boolean. We'll come back to why binary scoring is non-negotiable in Section 8."

**Closing the section:** "If you only measure #1, you're flying blind. If you measure all five, you can debug regressions in hours instead of days."

---

**`[BRIDGE — §4 → §5]`** End §4 on the five-grader code slide. Then call attention to what every grader takes as input:

> "Look at every one of these graders. What do they all have in common? Every single one takes a *trace* as input. None of them work without it. So if I told you 'evals are the foundation of shipping AI'... I lied a little. Tracing is the foundation. Evals are what you build on top of it. We need to fix that before we go any further."

---

### Section 5 — Tracing & debugging: the foundation (7 min)

**Goal:** Establish that you can't evaluate what you can't see. This section is what unlocks every other one.

**Open with this:**

> "Evals don't start with a grader. They start with a trace. If you can't replay what your agent did — every tool call, every model invocation, every intermediate output — you can't grade it, you can't debug it, and you definitely can't compare two versions of it. Tracing is the substrate."

**Slide: What a useful agent trace contains**

```
ROOT SPAN: agent_run(task="fix issue #4821")
├── span: search_repo("token expiry")          [120ms]
├── span: read_file("src/auth.py")             [45ms]
├── span: model_call(claude-sonnet-4-6)        [2.4s, 3.2k tok in, 412 tok out]
├── span: edit_file("src/auth.py", ...)        [80ms]
├── span: run_tests()                          [12.1s] ← FAILED
├── span: model_call(claude-sonnet-4-6)        [1.8s, 4.1k tok in, 280 tok out]
├── span: edit_file("src/auth.py", ...)        [80ms]
└── span: run_tests()                          [11.9s] ← PASSED
```

Walk through it: parent-child structure, timing per span, model + token counts on every LLM call, the failure-then-retry pattern visible at a glance.

**`[DEMO — 2 min]` Trace a real failing run, find the bug.**

Open a trace UI on a known failure (Langfuse, Arize Phoenix, LangSmith, or your own). Walk through it on stage:

1. *"Here's a run that closed the issue but the user reverted the PR."* — show the trace
2. Click into the model call where it picked the file to edit. Show the prompt.
3. Show the tool call: `edit_file("src/auth.py", ...)`. Then show that the actual issue was in `src/auth/middleware.py`.
4. Point at the diagnostic: the agent never ran `grep` to find the symbol — it pattern-matched on the filename.
5. *"Without this trace I'd be guessing. With it, the fix is obvious: add `grep` higher in the tool priority, or add a system-prompt nudge to verify file paths before editing."*

This 2 minutes will earn the audience for the rest of the workshop. They've seen tracing turn a guess into a diagnosis.

**The tooling landscape (30s — name them, don't sell them):**

- **Langfuse, LangSmith, Arize Phoenix** — purpose-built LLM trace UIs
- **Logfire, Honeycomb, Datadog APM** — general APM, increasingly LLM-aware
- **OpenTelemetry GenAI conventions** — the emerging open standard for LLM spans. If you're starting today, build on OTel; the vendor doesn't matter, the data does.

**`[CODE SNIPPET]` What instrumentation actually looks like:**

```python
from opentelemetry import trace
tracer = trace.get_tracer("coding-agent")

@tracer.start_as_current_span("agent.run")
def run_agent(task: str) -> AgentResult:
    span = trace.get_current_span()
    span.set_attribute("agent.task", task)

    for step in agent_loop(task):
        with tracer.start_as_current_span(f"tool.{step.tool}") as s:
            s.set_attribute("tool.name", step.tool)
            s.set_attribute("tool.args", json.dumps(step.args))
            result = execute(step)
            s.set_attribute("tool.result_len", len(result))
    ...
```

> "If your agent doesn't have spans like this today, that's the first thing you do Monday. Everything else in the workshop assumes you have traces."

**Connection to evals — say this explicitly:**

> "Your traces *are* your eval dataset. Every prod run is a candidate eval case. Every failure is a regression test waiting to be written. Tracing isn't a separate concern from evals — it's the same project."

---

**`[BRIDGE — §5 → §6]`** End §5 on "your traces are your eval dataset." Then transition by inventorying what they have:

> "So now look at what you've got. You're tracing your agent — every tool call, every model invocation, every cost number. You know the five things to grade — task success, trajectory, tool use, safety, cost. We've got the inputs. We've got the graders. Now we put it together into something that actually catches regressions on every PR. This is where the workshop becomes hands-on."

---

### Section 6 — Build the eval suite: workshop walkthrough (12 min)

**Goal:** This is the practical heart of the talk. Be opinionated.

**Slide: The five-step playbook.**

```
1. Look at your data first
2. Build the dataset from real failures
3. Pick the right grader for each criterion
4. Wire it into CI
5. Close the loop with production
```

#### Step 1 — Look at your data first (≈2 min)

- Before you write a single eval, **read 50–100 real traces.** No shortcuts. No outsourcing.
- This is called **error analysis**. You're looking for failure modes you didn't predict.
- Hamel Husain's rule: *"Write evals for errors you discover, not errors you imagine."*
- Counter-take to "eval-driven development": writing evals before you've seen real failures usually produces metrics that don't predict actual quality.

#### Step 2 — Build the dataset (≈2 min)

- Source from: real production traffic, support tickets, the failure cases you found in step 1.
- **Stratify** by failure type. If 30% of your failures are tool-arg errors, your eval set should have ≈30% tool-arg cases.
- Aim for **100–500 examples** to start. More is not always better — quality of labels >> quantity. *(You'll see "20–30 is enough to start" advice in some places; in my experience 20 examples won't surface the long tail of failure modes that actually bite in prod. Start at 100.)*
- *For a coding agent, your dataset is golden if it includes:* a mix of bug fixes, feature additions, refactors, and "underspecified" issues that should trigger clarification rather than action; a spread across small, medium, and large repos; tasks with and without good test coverage; tasks where the obvious fix is wrong.
- *Tip:* If you have user feedback (thumbs up/down), the thumbs-down traces are gold. For a coding agent, every PR your users **rejected, reverted, or had to fix** is a future eval case.

#### Step 3 — Pick the right grader (≈3 min)

Three types, in order of preference when applicable:

| Grader | When to use | Cost | Reliability |
|---|---|---|---|
| **Code / assertion** | Structured outputs, tool args, JSON schemas | Free | Highest |
| **LLM-as-judge** | Subjective quality, tone, helpfulness | $$ | Medium — needs calibration |
| **Human review** | Anything novel, ground truth, calibration | $$$ | Highest, doesn't scale |

**Crucial point on LLM-as-judge:**
- It's the dominant pattern in 2026 for production monitoring.
- But **you must calibrate it against humans.** Run the judge and a human on the same 100 examples; check agreement. If it disagrees with humans more than 20% of the time, your judge prompt is the bug.
- Use a **stronger model than the one you're evaluating** as the judge when possible.
- Prefer **binary or 3-point** rubrics over 1–5. Likert scales drift; binary doesn't.

> *Use code when you can, models when you must, and humans to calibrate.*

For a coding agent, that ordering is unusually friendly: most of what you care about *is* code-checkable.
- Did the tests pass? `pytest --json-report`.
- Was the right file edited? Diff the file paths.
- Was the patch minimal? Count touched lines.
- Did the agent disable a test? `git diff` for `skip`, `xfail`, removed assertions.
- LLM-judge only for the genuinely subjective stuff: "is the code idiomatic?", "is the PR description clear?".

#### Step 4 — Wire into CI (≈3 min)

- Evals should run on every PR that touches the agent (prompts, tools, model version, scaffolding).
- Treat regressions like test failures. Same model + same dataset + worse score = block the merge.
- Budget matters: keep a "fast" eval suite (~50 examples, runs in 2 min) and a "full" suite (full dataset, runs nightly).
- This is the single highest-leverage move. Most teams skip it.

**`[DEMO — 90s]` Run the eval suite live.**

On stage, run something like this — pre-recorded if you can't trust the network:

```bash
$ pytest evals/ -v --eval-report

evals/test_task_success.py::test_issue_4821     PASSED   [12.4s]
evals/test_task_success.py::test_issue_4822     PASSED   [8.1s]
evals/test_trajectory.py::test_minimal_path     FAILED   [trace: 19 tool calls, expected ≤ 8]
evals/test_safety.py::test_no_disabled_tests    PASSED   [0.2s]
evals/test_cost.py::test_under_budget           FAILED   [$2.40 > $1.50]

============== 18 passed, 2 failed ==============
SCORE DELTA vs main: pillar_trajectory -0.04, pillar_cost -0.07
```

Walk through the output:
> "This is what 'evals as CI' actually feels like. The diff isn't just 'tests passed.' It's a vector — five pillars, each with a delta. If any pillar regresses beyond a threshold, the merge blocks. The PR description gets a comment with the regression. This is how we ship coding-agent changes the same way we ship anything else."

#### Step 5 — Close the loop with prod (≈2 min)

- Run the *same* judges on a sample of production traffic.
- When prod scores diverge from offline scores, you have a dataset drift problem — feed those examples back in.
- Pre-launch and post-launch numbers should be directly comparable. If they're not, the eval is lying to you.
- *Callback to Section 5:* every prod trace you logged is a candidate eval case. The pipeline should be: prod failure → trace → grader fires → annotated example added to dataset → next CI run catches it. That loop is the whole game.

**Slide ending the section:** *"Your eval pipeline is more important than your prompt."*

---

**`[BRIDGE — §6 → §7]`** End §6 on "your eval pipeline is more important than your prompt." Then deliver the payoff:

> "If you've followed me this far, you now have a system that catches regressions on every PR. You've got a CI gate. You've got prod monitoring. That's nice. But here's the moment that, the first time I saw it work, made me actually believe in evals. Here's what changes when you have all of this in place. You stop being afraid of model upgrades. You stop being afraid of prompt changes. Let me show you exactly what that looks like."

---

### Section 7 — Model & prompt regression: the killer demo (8 min)

**Goal:** Make the case that this is the single highest-ROI thing evals enable. Every SDE in the room has wondered "should we upgrade the model?" — this section shows them what the answer looks like when you have evals.

**Open with the audience question:**

> *"`[AUDIENCE]` Show of hands — when a new model dropped last quarter, how many of your teams upgraded? ... How many of you can answer, with data, whether that upgrade made your product better or worse?"*

(Most hands drop on the second question. That's the gap this section closes.)

**Frame the problem:**

There are two regression problems every team faces, and they're the same problem:

1. **Model upgrades.** Your vendor releases a better model. Should you switch? Your old prompts may not work the same. New failure modes may appear.
2. **Prompt changes.** A teammate tweaks the system prompt to fix one bug. Did they regress something else?

Without evals, both are vibes. With evals, both are mechanical.

**The flow — put this on a slide:**

```
1. Snapshot baseline:    eval suite × current model × current prompt → score vector
2. Change one variable:  eval suite × NEW model × current prompt    → score vector
3. Diff the vectors:     where did it improve? where did it regress?
4. Tune (if needed):     eval suite × NEW model × NEW prompt        → score vector
5. Decide:               ship, rollback, or partial rollout
```

The trick is changing **one thing at a time**. If you swap the model and the prompt simultaneously, you can't attribute the delta. Treat it like a bisect.

**`[DEMO — 3 min]` Walk through a real model upgrade.**

This is the centerpiece demo. Use a pre-recorded video if you can't trust live runs.

Show three eval runs side by side, in a table:

| Pillar | Sonnet 4.5 + prompt v1 | Sonnet 4.6 + prompt v1 | Sonnet 4.6 + prompt v2 |
|---|---|---|---|
| Task success (pass^5) | 0.72 | 0.81 | **0.84** |
| Trajectory (avg tool calls) | 6.2 | 9.8 ⚠️ | **5.4** |
| Tool args correctness | 0.94 | 0.96 | **0.97** |
| Safety (zero violations) | 100% | 100% | 100% |
| Cost per task | $0.84 | $1.30 ⚠️ | **$0.79** |

Walk through the story:
1. *"Sonnet 4.6 is more accurate (0.72 → 0.81 on pass^5) — that's a real win on task success."*
2. *"But it also wanders more — 6.2 → 9.8 tool calls. And cost jumped 55%. If we'd shipped on the first column alone, our customers would notice the agent feels slower and our infra bill would balloon."*
3. *"We dug into traces (callback to Section 5) and saw 4.6 explores more before committing. So we tightened the system prompt — added 'prefer minimal exploration; commit to the first plausible fix.' That's prompt v2."*
4. *"Third column: better task success **and** fewer tool calls **and** lower cost. Now we ship."*

That's the flow. The point isn't the specific numbers — it's that **you can see the tradeoff**. Without evals, you'd have shipped column 2 and slowly noticed your bill creeping up over 6 weeks.

**Two patterns worth naming:**

**1. Shadow evals on prod traffic.**

Run the candidate model in shadow mode against a sample of real production tasks. Don't return its output to users — just grade it. Compare to the prod model's score on the same tasks. This is the cleanest way to validate a model upgrade without committing to it.

```python
@trace_span("shadow_eval")
def shadow_run(task, prod_response):
    candidate_response = run_with_model("claude-sonnet-4-7", task)
    log_comparison(task, prod_response, candidate_response,
                   prod_score=grade(prod_response),
                   candidate_score=grade(candidate_response))
```

**2. Prompt versioning + A/B over CI.**

Treat prompts like code. Every prompt change is a PR. CI runs the eval suite and posts the score delta as a comment. No prompt change ships unless every pillar's regression is within tolerance.

> *"This is the moment evals stop being overhead and start being a superpower. Every team I've seen do this can ship to a new model 4–6 weeks before teams that don't. That's a competitive advantage that compounds."*

**The closing line for this section:**

> *"You don't have to choose between 'move fast' and 'don't break things.' Evals are how you do both."*

---

**`[BRIDGE — §7 → §8]`** End §7 on "you don't have to choose between move fast and don't break things." Then transition to lessons learned:

> "Before we land this plane, I want to give you the things I wish someone had told me before I built this the first time. Eight quick lessons from doing it wrong."

---

### Section 8 — Pitfalls and hot takes (3 min)

**Goal:** Memorable, opinionated, sharable.

Rapid-fire — one slide per take, ~20 seconds each:

1. **"Eval-driven development is mostly wrong."** Look at data first; write evals for failures you've actually seen.
2. **"Don't outsource your annotations."** Domain expertise is the bottleneck. If you can't label it, you can't ship it.
3. **"Likert scales lie."** A 1–5 score from a judge is two bits of signal cosplaying as five. Use binary + a reason.
4. **"More metrics ≠ better evals."** 5 well-chosen metrics beat 30 noisy ones. Every metric you add is a metric someone has to maintain.
5. **"Your judge needs evals too."** It's an LLM. Calibrate it like one. Otherwise you're measuring with a broken ruler.
6. **"Production is the real test set."** If your offline evals don't track prod quality, fix the evals, not the agent.
7. **"`pass@1` is marketing. `pass^k` is engineering."** A coding agent at 85% pass@1 and 40% pass^5 will feel broken to your users. Report both.
8. **"For coding agents, your real moat isn't the model — it's the eval loop."** Anyone can pick the same model you use. Almost no one will build the same eval suite.

**End the section with this one big idea on a slide:**

> *"You don't have an eval problem. You have a 'looking at your data' problem. The eval is just the artifact."*

---

**`[BRIDGE — §8 → §9]`** End §8 on "you don't have an eval problem, you have a 'looking at your data' problem." Then close the loop on the talk:

> "Which brings me to what I actually want you to do tomorrow."

---

### Section 9 — Closing + Monday-morning checklist (2 min)

**Goal:** Send them home with concrete actions.

**Optional 30-second slide before the checklist — "where are you?":**

```
Stage 1: Vibes. A few demo prompts. Manual squinting.
Stage 2: A curated dataset. Pass/fail. You can compare two prompts.
Stage 3: Mixed graders, repeated runs (pass^k), CI gate, failure taxonomy.
Stage 4: Prod monitoring, A/B tests, dataset auto-refresh from real traffic.
Stage 5: Org-wide eval culture. Quality bars are release gates.
```

> "Most teams I meet are at Stage 1. The Monday-morning checklist gets you to Stage 2 in a week and Stage 3 in a month. That's the goal of this talk."

**Slide: What to do Monday morning**

```
[ ] Add OTel-style tracing if you don't have it. Spans for tool calls + model calls.
[ ] Pull 50 real traces from your agent. Read all of them.
[ ] Group failures into 3–5 buckets. That's your eval taxonomy.
[ ] Build a 100-example dataset weighted by those buckets.
[ ] Pick ONE grader per bucket (code > LLM-judge > human).
[ ] Run each task k=5 times. Report pass^5, not just pass@1.
[ ] Wire the suite into CI. Block merges on regression.
[ ] Calibrate any LLM-judge against 50 human-labeled examples.
[ ] Sample 1% of prod, run the same judges, watch for drift.
[ ] Lock in a versioned baseline so you can A/B the next model upgrade.
```

**Closing line — mirror the opening (recurring thread: "vibes don't scale"):**

> "We started this hour with a coding agent that 'fixed' a test by deleting the assertion. Green CI. Clean diff. Immaculate vibes. Broken product. Every single thing we've talked about today — the pillars, the traces, the eval suite, the model-upgrade flow — exists for one reason: to catch that PR before it lands. Vibes don't scale past 20 examples. Evals do. The teams that figure this out first are the ones who'll be shipping on the next model in a week, not stuck on the one they shipped with. Go build the eval loop. That's the muscle. That's the moat. Thank you."

**Final slide:** Your name, contact, talk repo / blog link, and the Monday-morning checklist (so they can photograph it).

---

## 3. Delivery notes

### Pacing
- **Don't rush the cold open.** 4 minutes feels long; do it anyway. The hook + the deleted-assertion demo earn the next 50.
- **Sections 5–7 are the workshop spine** — tracing, the eval-suite walkthrough, and the model regression demo. Roughly half your total prep time goes here. These are also the sections that need the cleanest pre-recorded demos.
- **Land on time.** Going over loses goodwill. If you're behind, the easiest cuts are: shorten Section 4 by collapsing the five-grader code slide (saves ~1 min), and drop the "shadow evals on prod traffic" sub-pattern in Section 7 (saves ~1.5 min).

### Audience interaction
- Open with a hand-raise (Section 1).
- Mid-talk: ask "who here has had an LLM-as-judge disagree with you?" before Section 5, Step 3.
- Don't take Q&A mid-talk. Defer to the end. It wrecks pacing.

### Slide design
- One idea per slide.
- Code/data screenshots > bullet points wherever possible.
- Use real traces, real diffs, real metrics — anonymized, not made-up.
- Dark theme; SDEs are coming from terminals.

### Demos — there are five in this script. Rehearse all of them.
1. **`Section 1` — deleted-assertion screenshot** (60s). Static. Lowest risk.
2. **`Section 3` — real trace JSON / UI screenshot** (90s). Static or short clip.
3. **`Section 4` — five graders as code** (30s). Static slide.
4. **`Section 5` — trace UI walkthrough on a known failing run** (2 min). Pre-record on Langfuse / Phoenix / your tool of choice. Live only if you've practiced 3+ times.
5. **`Section 6` — `pytest`-style eval suite running in terminal** (90s). Pre-record. Most likely to break live.
6. **`Section 7` — model upgrade comparison table** (3 min). Pre-recorded with screenshots of three eval runs side-by-side.

**Default to pre-recorded video for all of them.** Live demos at conferences fail at exactly the rate you'd expect — 30%+ — and a failed demo eats the rest of your slot. Pre-record, narrate over it. The audience won't care; they'll care that the content was clear.

### Things to rehearse hard
- The cold open story (it sets the tone).
- The pillars list — if you can recite all five without the slide, you've earned the room.
- The Monday-morning checklist — slow down, let them photograph it.

---

## 4. Things to prepare before the talk

- **A real failure story.** Yours, ideally. Anonymized as needed. This is the strongest opening. The "deleted assertion" demo is the visual companion.
- **A real trace JSON or trace-UI screenshot.** Anonymized. Used in Sections 3, 5, 6.
- **A trace-UI walkthrough video (Section 5 demo).** ~90 sec, narrating a real failing run end to end. This is the most important asset in the entire workshop — it earns the audience.
- **A pre-recorded eval-suite run (Section 6 demo).** Terminal output of `pytest evals/` with pass/fail and a regression delta.
- **A model-upgrade comparison table (Section 7 demo).** Three eval runs, three columns, the "ship column 3" story. This is the climax.
- **One screenshot of an LLM-judge prompt** with a calibration result (agreement rate vs human). For Section 6, Step 3.
- **A short list of tracing/eval tools for the closing slide** — pick 3, not 10. Tracing: Langfuse, Arize Phoenix, OTel + Logfire. Evals: LangSmith, Braintrust, Inspect (or your own pick of: DeepEval, MLflow, Confident AI). Stay tool-agnostic in the talk; let the audience choose.
- **Backup slides** in case Q&A is thin: cost/latency deep-dive, multi-agent eval challenges, eval for RAG specifically.

---

## 5. Likely Q&A — be ready

| Question | Short answer to have ready |
|---|---|
| "How big should my eval set be?" | Start at 100. Grow with failures. Quality of labels matters more than count. |
| "Should I use LLM-as-judge or human?" | Both. Humans calibrate the judge; the judge scales. |
| "Which framework should I pick?" | They're converging. Pick the one your team will actually use. The dataset is more durable than the framework. |
| "How do I evaluate multi-agent systems?" | Same pillars, applied per-agent and at the orchestration layer. Inter-agent handoffs are the #1 failure mode. |
| "What about RAG?" | Two-part eval: retrieval (recall@k, grounding) and generation (faithfulness, answer quality). Most "RAG bugs" are retrieval bugs. |
| "How often do I rerun evals?" | Fast suite on every PR. Full suite nightly. Production sample continuously. |
| "What about `pass@1` vs `pass^k`?" | `pass@1` is the chance one run succeeds. `pass^k` is the chance *k* independent runs all succeed — closer to "does this feel reliable to a user." For high-stakes tasks, optimize `pass^k`. |
| "What about public benchmarks?" | Useful for picking a candidate model, not for proving your product works. Your own task distribution is the only benchmark that matters for shipping. |
| "Which tracing tool should I pick?" | OTel-first if you're greenfield. The data outlives the vendor. Pick a UI on top of OTel (Phoenix, Logfire, etc.) rather than locking into a proprietary trace format. |
| "How do I A/B test prompts in prod?" | Same flow as model upgrades: shadow run on a sample, score with the same graders, only promote when the diff is positive across pillars and within tolerance on cost/latency. |

---

## 6. References worth citing on slides

- Anthropic — *Demystifying evals for AI agents*: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Hamel Husain — *Your AI Product Needs Evals*: https://hamel.dev/blog/posts/evals/
- Hamel Husain — *LLM Evals FAQ*: https://hamel.dev/blog/posts/evals-faq/
- Hamel Husain — *LLM-as-a-Judge*: https://hamel.dev/blog/posts/llm-judge/
- AWS — *Real-world lessons evaluating agentic systems at Amazon*: https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon/
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Langfuse, Arize Phoenix, LangSmith — three of the more mature trace-UI options if you don't want to roll your own.

---

## 7. One-paragraph abstract (for the conference program)

> AI agents fail in ways that traditional software doesn't, and the testing practices we've spent decades refining — unit tests, assertions, snapshot diffs — were never designed for systems that produce different outputs to the same input. This is a workshop-style talk: heavy on live examples, real traces, and code you can take home. Using a repo-aware coding agent as the running example, we'll walk through the five pillars every team should measure (task success, trajectory, tool use, safety, cost/latency), how to instrument an agent so failures are debuggable, how to wire evals into CI, and — the killer use case — how to upgrade models and prompts confidently without breaking your product. You'll leave with the Monday-morning checklist, the code patterns, and the demo videos to do this on your own agent the day you get back.

---

## 8. Compressing to 45 minutes (if your slot is fixed)

If you can't get a 60-min slot, this is the order in which to cut:

1. **Section 7 — drop the "shadow evals on prod traffic" sub-pattern** (saves ~1.5 min). The model-upgrade comparison demo is non-negotiable; the shadow pattern is bonus.
2. **Section 6 — collapse Steps 1+2 into a single step** ("look at your data, build the dataset"). Saves ~2 min.
3. **Section 4 — cut the five-grader code slide to three pillars** (saves ~1 min). Mention the other two verbally.
4. **Section 5 — keep the trace demo, drop the OTel code snippet** (saves ~1 min). The demo is what matters.
5. **Section 8 (pitfalls) — cut from 8 hot takes to 4** (saves ~1 min). Keep #1, #3, #7, #8.

That gets you to ~45 min content + 5 Q&A. The two NEW sections (Tracing, Model regression) survive intact — they're the workshop's spine.

**Even tighter (40-min slot):** Combine Section 8 (pitfalls) into Section 9 (close) — turn the hot takes into a single "things I wish I'd known" slide before the Monday checklist.

---

## 9. Audience handout (optional, but high-leverage)

If the conference allows handouts or a QR code to a takeaway page, link to a small repo containing:

- The five-grader code snippets (runnable, MIT-licensed)
- A starter `pytest`-style eval runner (~50 lines)
- A sample OTel-instrumented agent loop
- The Monday-morning checklist as a markdown file

This is what turns the talk from "interesting" to "I started building this on the train home." Workshop talks earn their value when the audience leaves with code.
