# Evals For AI Agents: How To Know Your Agent Actually Works

## Talk goal

This is a 45-minute conference talk for a technical audience, mostly working SDEs.  
The talk should help engineers move from "we built an agent demo" to "we can measure if this system is reliable enough to ship."

Core thesis:

> In AI systems, especially agents, the hard problem is no longer just generation.  
> The hard problem is building a measurement system that tells us if the agent is useful, reliable, safe, and improving over time.

---

## Recommended framing

If you want the talk to land well with engineers, do not position evals as an "ML research thing."  
Position evals as:

- the testing strategy for nondeterministic software
- the feedback loop that lets teams improve prompts, tools, routing, and models
- the control system for shipping agents without blind faith

This angle will resonate with SDEs because it maps to concepts they already care about:

- unit tests
- integration tests
- regression suites
- observability
- release gates
- production monitoring

---

## Suggested title options

1. `Evals for AI Agents: How to Know Your Agent Actually Works`
2. `Beyond Demos: Engineering Evals for AI Agents`
3. `Testing Nondeterministic Software: Evals for LLM Agents`
4. `From Prompting to Production: Evals for AI Systems`
5. `Why Your Agent Benchmark Score Is Not Enough`

Recommended title:

`Evals for AI Agents: How to Know Your Agent Actually Works`

---

## 45-minute structure

### 0. Intro and setup - 5 min

- Hook the audience
- Define the problem
- Explain why agent evals are different from normal software tests

### 1. What evals are - 6 min

- Basic definition
- Difference between model evals and system evals
- Why agent evals are harder

### 2. Why evals matter - 6 min

- Shipping risk
- Regression detection
- cost / latency / quality tradeoffs
- team alignment

### 3. The pillars of agent evals - 12 min

- task success
- trajectory quality
- tool correctness
- reliability / consistency
- cost and latency
- safety and policy adherence

### 4. How to run evals in practice - 10 min

- build a dataset
- choose graders
- run offline evals
- calibrate with humans
- connect to CI and production monitoring

### 5. Public benchmarks and what they are good for - 4 min

- SWE-bench
- GAIA
- AgentBench
- WebArena
- OSWorld
- Terminal-Bench
- tau-bench

### 6. Closing - 2 min

- memorable summary
- practical call to action

---

## Slide-by-slide script

## Slide 1 - Title

`Evals for AI Agents: How to Know Your Agent Actually Works`

### Speaker notes

Today I want to talk about something that becomes painfully important the moment you try to move from an AI demo to an actual product: evals.

If you've worked on an LLM app or an agent, you've probably had this experience. You try it five times, three runs look great, one is weird, one is catastrophic, and now nobody knows whether the system is good or whether you just got lucky.

That uncertainty is the heart of the problem.

In classical software, if a function is correct, it is correct. In agentic systems, correctness is statistical, contextual, and often spread across multiple steps, tools, and decisions. So the question becomes: how do we build the equivalent of testing, observability, and release confidence for nondeterministic systems?

That's what evals are for.

---

## Slide 2 - The hook

`The scariest AI failure mode is not that the model is dumb.`

`It is that the demo worked, so we assumed the system works.`

### Speaker notes

Engineers are trained to distrust anecdotal success. One passing run is not evidence. One cool demo is definitely not evidence.

The problem with LLM systems is that they are unusually good at producing false confidence:

- the output is fluent
- the failure may look almost correct
- the system may succeed on easy examples and fail on critical edge cases
- and agents add another layer: they can choose bad tools, use the right tool with bad arguments, get stuck in loops, or succeed but at absurd cost and latency

So when we say "the agent works," we should immediately ask: works on what, how often, at what cost, and with what failure modes?

---

## Slide 3 - What is an eval?

`An eval is a structured test for measuring model or system performance under representative tasks.`

### Speaker notes

OpenAI's eval guidance frames evals as structured tests for systems that remain variable from run to run. That's a useful mental model.

The simplest version is:

- define a task
- define what success means
- run the system
- grade the result
- aggregate outcomes

But for agents, that grading can happen at multiple layers:

- final answer quality
- whether the right tool was selected
- whether the tool arguments were correct
- whether policy constraints were followed
- whether the agent took too many steps
- whether it succeeded reliably across repeated runs

So an eval is not just "did the answer match."  
It is really a measurement harness around behavior.

---

## Slide 4 - Model evals vs system evals

`A strong model does not imply a strong agent.`

### Speaker notes

This distinction is one of the most important parts of the talk.

Model evals answer questions like:

- how good is this base model at reasoning?
- how good is it at coding?
- how good is it at function calling or extraction?

System evals answer different questions:

- does my prompt stack work?
- does my tool schema help or confuse the model?
- does my retrieval help?
- does my router send tasks to the right specialist?
- does my agent recover from partial failure?
- does the whole workflow work end to end?

An engineer in the audience should walk away with this sentence:

> We do not ship models. We ship systems built on models.

And system evals are what matter for production.

---

## Slide 5 - Why agent evals are harder

`Agents introduce action, state, and long-horizon failure.`

### Speaker notes

Agent evals are harder than single-turn LLM evals because the system is no longer just producing text.

It is:

- observing state
- choosing actions
- calling tools
- handling intermediate outputs
- updating a plan
- sometimes coordinating across multiple agents

This means there are more failure surfaces:

- wrong interpretation of the task
- wrong tool choice
- correct tool, wrong parameters
- failure to notice an error
- over-long trajectory
- hidden policy violation
- final answer looks good, but the underlying state is wrong

Anthropic's January 9, 2026 post on agent evals makes this point clearly: the same qualities that make agents useful also make them harder to evaluate.

---

## Slide 6 - Why evals matter

`Without evals, you are mostly doing vibes-based engineering.`

### Speaker notes

That line usually gets a laugh, but it's true.

Why do evals matter?

1. They catch regressions.
2. They let you compare prompts, models, tools, and architectures.
3. They expose where failures actually happen.
4. They make tradeoffs visible: quality vs latency vs cost.
5. They align teams around a measurable quality bar.

One thing I want to emphasize because it is very practical: evals are not just for research teams. They are often the highest-bandwidth way for product, engineering, and research to agree on what "better" means.

Anthropic makes a strong point here too: once you have evals, you get baselines and regression tests for latency, token usage, cost per task, and error rates on a stable task bank.

---

## Slide 7 - The industry shift that seems to be happening

`Trending shift: from model benchmarks to system reliability`

### Speaker notes

After looking at recent industry material, the pattern I see is this:

- less excitement about one-number model leaderboards
- more focus on workflow-level evaluation
- more emphasis on traces, tool use, and end-to-end task completion
- more concern about benchmark contamination and saturation
- more interest in reliability over repeated runs, not just best-case performance

This is especially visible in agent work.

For example:

- OpenAI's current eval docs focus heavily on workflow evals, tool selection, argument correctness, and agent handoffs.
- Anthropic's recent guidance emphasizes mixing code-based, model-based, and human graders.
- newer benchmarks increasingly test realistic environments: terminals, web apps, desktop environments, and multi-turn tool-user interactions.

So if you want the talk to feel current, this is the narrative:

> The field is maturing from "can the model answer?" to "can the system complete a real task reliably?"

---

## Slide 8 - A practical mental model

`Agent evals are the combination of:`

- `task evals`
- `trajectory evals`
- `operational evals`

### Speaker notes

This is a clean way to organize the rest of the talk.

Task evals ask:

- did the job get done?

Trajectory evals ask:

- how did the agent behave while doing it?

Operational evals ask:

- was the system economically and operationally viable?

If you only measure the final answer, you miss a lot.

For example, two agents may both succeed:

- one uses the right tool in 3 steps
- another wanders for 19 steps, burns money, and succeeds accidentally

Those should not get the same score in a production-minded team.

---

## Slide 9 - Pillar 1: Task success

`Did the agent accomplish the user goal?`

### Speaker notes

This is the most obvious pillar, and still the most important.

Examples:

- did the coding agent resolve the bug?
- did the research agent return the right answer with enough evidence?
- did the support agent complete the refund correctly?
- did the browser agent submit the form and update the state?

Task success should ideally be measured with the strongest objective signal available:

- exact match
- database state match
- unit/integration tests
- file diffs
- programmatic verifiers

The closer you can get to executable verification, the better.

This is one reason engineering audiences love benchmarks like SWE-bench and Terminal-Bench: they connect success to actual environment outcomes, not just textual similarity.

---

## Slide 10 - Pillar 2: Tool correctness

`Did the agent use the right tool, with the right arguments, at the right time?`

### Speaker notes

OpenAI's current guidance is especially useful here. It breaks workflow evals into questions like:

- was the correct tool selected?
- were the arguments extracted correctly?
- was the handoff to another agent appropriate?

This is a very practical layer because many agent failures are not "bad reasoning" in the abstract. They are procedural:

- selected `refund_order` before validating eligibility
- queried the wrong repo
- searched the wrong website
- passed malformed arguments to a tool
- used a powerful tool when a safer read-only tool would have been enough

This means we should evaluate not only the final result, but the contract between the agent and its tools.

---

## Slide 11 - Pillar 3: Trajectory quality

`The path matters, not just the destination.`

### Speaker notes

A big shift in agent evals is that traces are becoming first-class artifacts.

What do we care about in trajectories?

- number of turns
- loops or repeated actions
- unnecessary tool calls
- whether the plan adapts after failure
- whether the agent asks clarifying questions when needed
- whether it follows the intended workflow

This matters because trajectory quality is often a leading indicator.  
A system that succeeds today with messy trajectories may become fragile in production tomorrow.

For technical audiences, I would describe this as the difference between:

- black-box acceptance
- and white-box behavioral diagnostics

You need both.

---

## Slide 12 - Pillar 4: Reliability and consistency

`One successful run is not enough.`

### Speaker notes

This is one of the most important modern ideas in agent evals.

Because agents are nondeterministic, a single pass rate can hide instability.  
Anthropic highlights `pass^k` as a useful way to think about reliability: what is the probability that the system succeeds consistently across repeated trials?

That matters a lot in production.

If an agent succeeds 75% of the time, that might sound decent in a benchmark chart.  
But if users experience repeated failures on retry, the product will feel broken.

So for important workflows, don't just ask:

- did it pass once?

Also ask:

- how often does it pass across multiple runs?
- what is variance across seeds, model snapshots, or context differences?

Reliability is what converts a benchmark result into user trust.

---

## Slide 13 - Pillar 5: Cost and latency

`A correct agent that is too slow or too expensive is still a failed design.`

### Speaker notes

SDEs will appreciate this because it sounds like classic systems engineering.

In many teams, the winning agent is not the highest-quality one in isolation. It is the one on the best frontier of:

- task success
- latency
- token usage
- tool/API cost
- operational complexity

Anthropic explicitly points out that eval suites become a stable place to track latency, token usage, and cost per task.

That is powerful because it turns architecture debates into data:

- Should we use a bigger model only on hard cases?
- Is the planner worth it?
- Does retrieval help enough to justify the extra latency?
- Does a second verification pass increase quality enough to justify cost?

Without evals, these become opinion battles.

---

## Slide 14 - Pillar 6: Safety and policy adherence

`Useful is not enough. It also has to behave within bounds.`

### Speaker notes

For real systems, especially enterprise or customer-facing agents, we also need to evaluate:

- refusal behavior
- policy compliance
- permission boundaries
- sensitive data handling
- escalation behavior
- misuse resistance

An agent that completes tasks well but violates safety or policy is not production-ready.

This is where human review and carefully designed model-based graders often become important, because not all policy issues are easy to capture with exact matching.

---

## Slide 15 - The three grader pattern

`Most serious agent evals combine three grader types:`

- `code-based`
- `model-based`
- `human`

### Speaker notes

This is one of the clearest ideas from Anthropic's recent write-up, and it makes for a great slide.

Code-based graders:

- fast
- cheap
- reproducible
- great for tool calls, exact outputs, executable tests, and state verification

Model-based graders:

- flexible
- scalable
- useful for nuance and open-ended quality

Human graders:

- slow and expensive
- but still the gold standard for calibration

The important message is not to pick one.  
The important message is to compose them appropriately.

My phrasing for the audience would be:

> Use code when you can, models when you must, and humans to calibrate reality.

---

## Slide 16 - How to build an eval suite

`A practical workflow`

### Speaker notes

Here is the process I would recommend to most teams.

1. Pick a narrow but important workflow.
2. Write down what success means in operational terms.
3. Collect a representative task set.
4. Define graders for outcome, behavior, and operations.
5. Run the agent repeatedly.
6. Review failures manually.
7. Turn recurring failure modes into permanent eval cases.
8. Hook the suite into CI and model/prompt rollout decisions.

That last step is key: evals should not live in a notebook graveyard.  
They should influence shipping decisions.

---

## Slide 17 - Building the dataset

`Your eval is only as good as your task set.`

### Speaker notes

A weak eval dataset creates fake confidence.

Good eval datasets should include:

- common happy paths
- important edge cases
- high-value tasks
- tasks that are expensive when wrong
- adversarial or ambiguous inputs
- previously observed production failures

A simple recipe:

- start with 20 to 30 tasks
- add real traces from dogfooding or beta users
- keep a failure log
- every serious bug becomes a new regression case

This is very similar to how good engineering teams build test suites over time.

The suite should evolve with the product.

---

## Slide 18 - Offline evals vs online evals

`You need both. They answer different questions.`

### Speaker notes

Offline evals are for controlled comparison:

- prompt A vs prompt B
- model A vs model B
- routing strategy A vs B

Online signals are for reality:

- how real users behave
- what drift looks like
- what failures synthetic tasks missed

Anthropic's framing here is strong: automated evals are not the full picture. You still need production monitoring, A/B testing, and human review.

This is a good place to tell the audience:

> Offline evals are your first line of defense. Production monitoring is your ground truth.

---

## Slide 19 - What to instrument

`If you cannot trace it, you cannot improve it.`

### Speaker notes

For agents, observability is part of eval design.

Instrument:

- prompts and system instructions
- tool calls
- tool arguments
- intermediate observations
- final outputs
- token counts
- latency per step
- error categories

Once you have traces, you can do much better failure analysis:

- is the issue retrieval?
- is it wrong tool choice?
- is it planner weakness?
- is it context overflow?
- is it user ambiguity?

This is another industry trend: trace-level evaluation is becoming much more central than answer-only scoring.

---

## Slide 20 - Common anti-patterns

`What teams get wrong`

### Speaker notes

This slide will likely resonate a lot.

Common mistakes:

- grading only the final answer
- evaluating only on handpicked demos
- using generic public benchmarks as a proxy for product quality
- relying on LLM judges without human calibration
- ignoring cost and latency
- not repeating runs
- not converting production failures into regression cases
- over-optimizing to benchmark scores

I would especially stress this one:

> Public benchmarks are useful, but they are not a substitute for product-specific evals.

That is a point the audience should remember.

---

## Slide 21 - Public benchmarks: what they are for

`Benchmarks are good for orientation, not certification.`

### Speaker notes

Now we can talk about public benchmarks without overselling them.

What are benchmarks good for?

- understanding the shape of the field
- comparing systems on shared tasks
- pressure-testing general capabilities
- getting ideas for your own eval design

What are they not good for?

- proving your product is ready
- capturing your exact user distribution
- guaranteeing safety, cost, or operational fit

Also, one current industry concern is contamination and saturation.  
As benchmarks become famous, optimizing for them gets easier, and their value as a proxy for real-world performance drops.

That skepticism is worth bringing into the talk.

---

## Slide 22 - Benchmark quick tour

### Speaker notes

I'd present this as a map, not a leaderboard worship slide.

`SWE-bench`

- Great for coding agents
- Real GitHub issues, patch generation, test-based verification
- Good when your agent edits code in repositories

`GAIA`

- Broad benchmark for general AI assistants
- Emphasizes reasoning, tool use, browsing, and multimodal tasks
- Good for high-level generality, not product-specific certification

`AgentBench`

- Early broad benchmark for LLMs as agents across interactive environments
- Useful historically and conceptually for multi-environment agent evaluation

`WebArena`

- Self-hosted realistic web environments
- Good for browser and web-navigation agents

`OSWorld`

- Open computer environment benchmark
- Good for multimodal computer-use agents

`Terminal-Bench`

- Real terminal tasks in sandboxed environments
- Great for CLI and devtools agents

`tau-bench`

- Multi-turn tool-agent-user interaction
- Good for support and enterprise workflow agents with policy constraints

---

## Slide 23 - Suggested benchmark commentary

`How to talk about benchmarks honestly`

### Speaker notes

My suggestion is to say this explicitly:

If your company builds coding agents, a benchmark like SWE-bench is directionally relevant.

If you build customer support agents, tau-bench is probably more informative than a coding benchmark.

If you build browser automation, WebArena is more relevant.

If you build desktop or computer-use agents, OSWorld matters.

If you build general assistants, GAIA is interesting.

And in all cases, the benchmark is still less important than your own task distribution.

That framing sounds mature, and it avoids the trap of chasing fashionable numbers.

---

## Slide 24 - A concrete example for engineers

`Suppose we are evaluating a repo-aware coding agent`

### Speaker notes

Let's make this concrete.

Imagine the agent can:

- search a repo
- read files
- edit code
- run tests
- explain changes

What might the eval suite contain?

Outcome graders:

- did the relevant tests pass?
- did the patch fix the intended bug?

Behavior graders:

- did it edit the right files?
- did it avoid unrelated changes?
- did it ask for clarification when the issue was underspecified?

Operational graders:

- total runtime
- tool count
- token usage
- cost per resolved task

Safety graders:

- did it avoid destructive commands without approval?
- did it respect repo boundaries?

Now the audience can see that "evals" are not abstract. They are just good engineering discipline applied to agent behavior.

---

## Slide 25 - A practical maturity model

`How teams usually evolve`

### Speaker notes

This is a great slide because many teams will see themselves in it.

Stage 1:

- manual testing
- vibes
- a few demo prompts

Stage 2:

- curated offline dataset
- pass/fail checks
- prompt and model comparisons

Stage 3:

- mixed graders
- repeated runs
- regression gates in CI
- failure taxonomy

Stage 4:

- production monitoring
- A/B testing
- automatic trace sampling
- continual dataset refresh from real traffic

Stage 5:

- organization-wide eval culture
- shared benchmark definitions
- quality bars for release

This helps engineers see evals not as a one-time project, but as an evolving capability.

---

## Slide 26 - The big takeaway

`The best teams treat evals as product infrastructure.`

### Speaker notes

If there is one message I want people to remember, it is this:

Evals are not a side project.

They are not a spreadsheet you make before a launch.

They are not just leaderboard numbers.

They are the measurement infrastructure that lets you improve an AI system with confidence.

The teams that get good at agents will not just have better prompts or better models.
They will have better eval loops.

---

## Slide 27 - Closing

`Build agents if you want.`

`But build evals first if you want to sleep at night.`

### Speaker notes

I'll end with this:

In normal software, testing protects us from deterministic bugs.

In AI systems, evals protect us from probabilistic failure, hidden regressions, false confidence, and benchmark theater.

So if you're building agents, don't ask only:

- Which model should we use?

Also ask:

- What is our task set?
- What does success mean?
- How do we grade it?
- How reliable is it?
- What fails in production?

Because in the long run, the real moat is not just model choice.
It is having a better feedback loop than everyone else.

---

## Optional 5-minute Q&A prompts

These are likely questions from a technical audience.

### Q: Are LLM judges trustworthy?

Suggested answer:

They are useful, but not enough on their own. Use them for scale and nuance, but calibrate them against human judgment and prefer code-based verification when available.

### Q: How many eval examples do I need to start?

Suggested answer:

Start surprisingly small. Even 20 to 30 representative tasks are enough to begin comparing versions. The key is that the tasks are real and high-signal.

### Q: Should we optimize for public benchmarks?

Suggested answer:

Use public benchmarks for orientation and external comparison, but optimize primarily for your product's own task distribution.

### Q: How often should we refresh evals?

Suggested answer:

Continuously. Production failures, newly observed edge cases, and major workflow changes should feed back into the eval set.

### Q: Are evals only for large teams?

Suggested answer:

No. Small teams may benefit even more, because evals prevent endless subjective debate and reduce wasted iteration.

---

## If you want to make the talk stronger

These are optional improvements if you convert this into slides.

### Add one failure trace

Show a real or synthetic agent trace:

- task
- tool calls
- failure point
- corrected version

This makes trajectory-based evals feel tangible.

### Add one architecture comparison

Example:

- single agent
- planner + executor
- router + specialist agents

Then show how evals helped choose one.

### Add one "benchmark vs product eval" table

Columns:

- purpose
- strengths
- blind spots

This helps people not misuse benchmarks.

---

## Strong one-liners for delivery

Use these lines during the talk to keep it sharp.

- `A demo is an anecdote. An eval is evidence.`
- `We do not ship models. We ship systems built on models.`
- `For agents, the path matters almost as much as the answer.`
- `One passing run is not reliability.`
- `Without evals, you are doing vibes-based engineering.`
- `Public benchmarks give orientation. Product evals give confidence.`
- `The real moat is the feedback loop.`

---

## Sources and current industry signals

These were useful for shaping the talk and reflect what seems current as of May 2, 2026.

### Official / primary sources

- OpenAI, `Evaluation best practices`
  - https://developers.openai.com/api/docs/guides/evaluation-best-practices
  - Useful points: generative AI is variable; workflow-level evals should test tool selection, argument correctness, and handoffs.

- OpenAI, `Evaluate agent workflows`
  - https://developers.openai.com/api/docs/guides/agent-evals
  - Useful for current OpenAI framing around workflow and agent evaluation.

- Anthropic, `Demystifying evals for AI agents` published January 9, 2026
  - https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
  - Useful points: combine code-based, model-based, and human graders; track latency, cost, and token usage; pair offline evals with production monitoring and A/B tests.

### Benchmark sources

- GAIA dataset and leaderboard
  - https://huggingface.co/datasets/gaia-benchmark/GAIA
  - https://huggingface.co/spaces/gaia-benchmark/leaderboard

- SWE-bench collection
  - https://huggingface.co/collections/princeton-nlp/swe-bench

- AgentBench
  - https://github.com/THUDM/AgentBench

- WebArena
  - https://www.cmu.edu/flame/research/2024/webarena.html

- OSWorld
  - https://github.com/xlang-ai/osworld

- Terminal-Bench
  - https://github.com/harbor-framework/terminal-bench

### My synthesis of what is trending

This part is my interpretation from the sources above:

- The industry conversation has shifted from pure model quality toward end-to-end system evaluation.
- Reliability across repeated runs is becoming more important than single-run benchmark wins.
- Trace and workflow evaluation are becoming central, especially for agents.
- Public benchmarks remain useful, but many practitioners are more cautious now about contamination, saturation, and overfitting to leaderboard metrics.
- Environment-based benchmarks for coding, terminal use, browsing, and computer use are increasingly relevant because they test action, not just text generation.

---

## Final recommendation

If you want the talk to be memorable, do not present it as a survey of benchmarks.

Present it as a practical engineering talk with this storyline:

1. Agents are nondeterministic systems.
2. That breaks our usual intuition about testing.
3. Evals are how we restore engineering discipline.
4. Good agent evals measure outcome, behavior, reliability, cost, and safety.
5. Public benchmarks help, but your product needs its own eval loop.

That framing will play well with strong SDE audiences.
