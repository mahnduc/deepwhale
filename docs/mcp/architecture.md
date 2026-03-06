**Thứ tự điều khiển (Control flow)**

    User
    ↓
    Orchestrator
    ↓
    PlannerAgent
    ↓
    Execution Plan
    ↓
    Orchestrator 

**Thứ tự suy luận (Reasoning flow)**

    Planner → Plan → Execution

**Tổng quan tầng hệ thống**

    User nhập câu hỏi
        ↓
    Tauri gửi command
        ↓
    MCP Tool nhận JSON
        ↓
    Tool handler gọi Orchestrator
        ↓
    Orchestrator gọi Planner
        ↓
    Planner trả Execution Plan
        ↓
    Orchestrator thực thi từng bước

*Orchestrator luôn là entry point của business logic.*

**Design Orchestrator**

    class Orchestrator:

    def handle_request(self, message):
        plan = self.create_plan(message)
        return self.execute_plan(plan)

    def create_plan(self, message):
        return self.planner.run(message)

    def execute_plan(self, plan):
        results = []
        for step in plan["steps"]:
            result = self.execute_step(step)
            results.append(result)
        return self.synthesize(results)

    def execute_step(self, step):
        agent = self.registry[step["agent"]]
        return agent.run(step["task"])

    def synthesize(self, results):
        return self.synthesizer.run(results)

**Kiến trúc Orchestrator**

    handle_request()
        ↓
    create_plan()
        ↓
    validate_plan()
        ↓
    execute_plan()
        ↓
    synthesize()