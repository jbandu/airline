# Fix Missing Agent Links - Migration 006

## Issue

At https://valayam.app/agents, the new baggage agents don't show links like the earlier agents do.

**Root Cause**: The baggage agents created in migration 004 are missing two critical fields:
- `workflow_count` - Number of workflows this agent participates in
- `active_instances` - Number of active running instances

The Agent Network page (`/agents`) uses the `v_agent_network` view which expects these fields to display metrics and collaboration links.

## Solution

Run migration **006_add_agent_workflow_counts.sql** to add these fields to all 18 baggage agents.

## How to Run

1. **Open Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/jhhihlkjnicktyvycmig/sql
   ```

2. **Copy Migration 006**
   - File: `006_add_agent_workflow_counts.sql`
   - Copy entire contents

3. **Paste & Run**
   - Paste into SQL Editor
   - Click "Run" button

4. **Expected Output**
   ```
   ========================================
   ✅ MIGRATION 006 COMPLETE
   ========================================
   Updated 18 baggage agents with workflow_count and active_instances

   Agents should now appear properly in Agent Network view
   ========================================
   ```

## What This Fixes

### Before (Missing Fields)
```
Agent: Bag Intake & Tagging Agent
- No workflow count shown
- No active instances shown
- No collaboration links visible
```

### After (With Fields)
```
Agent: Bag Intake & Tagging Agent
- Workflow Count: 8
- Active Instances: 5
- Collaboration links: ✓ (connected to other agents)
```

## Workflow Counts Assigned

### Core Agents (8)
| Agent | Code | Workflows | Instances |
|-------|------|-----------|-----------|
| Bag Intake & Tagging | BAG_INTAKE_001 | 8 | 5 |
| Load Planning | LOAD_PLAN_001 | 12 | 8 |
| Real-Time Tracking | BAG_TRACK_001 | 15 | 12 |
| Connection Risk | CONN_RISK_001 | 10 | 6 |
| Exception Management | BAG_EXCEPT_001 | 18 | 10 |
| Lost & Found Matching | LNF_MATCH_001 | 6 | 3 |
| Compensation Automation | COMP_AUTO_001 | 14 | 7 |
| Interline Coordination | INTER_COORD_001 | 9 | 5 |

### Supporting Agents (10)
| Agent | Code | Workflows | Instances |
|-------|------|-----------|-----------|
| TSA Coordination | TSA_COORD_001 | 5 | 3 |
| Delivery Scheduling | DELIVERY_SCHED_001 | 7 | 4 |
| Damage Assessment | DAMAGE_ASSESS_001 | 6 | 3 |
| Passenger Communication | PASSENGER_COMM_001 | 12 | 8 |
| Special Handling | SPECIAL_HANDLE_001 | 8 | 4 |
| Rush Tag Manager | RUSH_TAG_MGR_001 | 4 | 2 |
| Document Validator | DOC_VALIDATOR_001 | 5 | 2 |
| Cost Allocation | COST_ALLOC_001 | 6 | 3 |
| Performance Analytics | PERF_ANALYTICS_001 | 10 | 5 |
| Root Cause Analysis | ROOT_CAUSE_001 | 8 | 4 |

## After Running

1. **Refresh** your browser at https://valayam.app/agents
2. **You should see**:
   - All 18 baggage agents with workflow counts
   - Active instance numbers
   - Collaboration links/edges between agents
   - Proper metrics in the network visualization

## Technical Details

The `v_agent_network` view query:
```sql
SELECT
  a.id,
  a.code,
  a.name,
  a.category_code,
  ac.name AS category_name,
  ac.icon,
  ac.color,
  a.autonomy_level,
  a.metadata,
  a.workflow_count,    -- ← Was NULL for baggage agents
  a.active_instances   -- ← Was NULL for baggage agents
FROM agents a
LEFT JOIN agent_categories ac ON a.category_code = ac.code
WHERE a.active = true;
```

The frontend code (AgentNetwork.tsx line 115-116) uses these to calculate totals:
```typescript
const totalWorkflows = agents.reduce((sum, agent) => sum + agent.workflow_count, 0);
const totalInstances = agents.reduce((sum, agent) => sum + agent.active_instances, 0);
```

When these fields were NULL/missing, the agents didn't contribute to the network metrics and links weren't displayed.

---

**Run migration 006 to fix the agent links!** ✅
