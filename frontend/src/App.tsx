import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Play, 
  UserCheck, 
  Activity, 
  DollarSign, 
  HelpCircle,
  Database
} from 'lucide-react';

interface Incident {
  id: string;
  event_type: string;
  details: string;
  status: 'INVESTIGATING' | 'PENDING_APPROVAL' | 'REMEDIATED' | 'ABORTED';
  risk_score: number;
  cost_estimate: number;
  remediation_plan: string;
  created_at: string;
}

interface Trace {
  timestamp: string;
  agent: string;
  action: string;
  output: string;
  latency_ms: number;
  tokens_consumed: number;
}

const BACKEND_URL = 'http://localhost:8000';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [operatorName, setOperatorName] = useState('Samuel Quansah');
  const [activeSimulation, setActiveSimulation] = useState('Public S3 Storage Bucket Detected');
  const [metrics, setMetrics] = useState({
    total_incidents: 0,
    active_incidents: 0,
    remediated_incidents: 0,
    total_tokens_consumed: 0,
    total_cost_saved_usd: 0.00
  });

  // Mock Fallback Database
  const [mockIncidents, setMockIncidents] = useState<Incident[]>([
    {
      id: 'inc-demo101',
      event_type: 'Public S3 Storage Bucket Detected',
      details: 'GuardDuty Alert: s3-bucket-01 open to public read access.',
      status: 'PENDING_APPROVAL',
      risk_score: 0.85,
      cost_estimate: 0.00,
      remediation_plan: 'Revoke public policy on S3 bucket. Apply default block public access configuration.',
      created_at: new Date(Date.now() - 3600000).toLocaleTimeString()
    }
  ]);
  const [mockTraces, setMockTraces] = useState<Record<string, Trace[]>>({
    'inc-demo101': [
      { timestamp: '10:04:12', agent: 'ArchitectAgent', action: 'Classified event signal', output: "Routed incident type: 'Public S3 Storage Bucket Detected' to security and compliance specialists.", latency_ms: 35, tokens_consumed: 12 },
      { timestamp: '10:04:13', agent: 'SecurityAgent', action: 'Checked AWS IAM & S3 configs', output: "Detected public read policy open to all principals on S3 bucket.", latency_ms: 110, tokens_consumed: 18 },
      { timestamp: '10:04:14', agent: 'RAGKnowledgeAgent', action: 'Queried S3 runbooks vector db', output: "Retrieved reference policy: 'SEC-04 Block S3 Public Access Directive'. Grounding citation found in SEC_RUNBOOK.pdf#L12-14.", latency_ms: 145, tokens_consumed: 24 },
      { timestamp: '10:04:15', agent: 'ComplianceAgent', action: 'Evaluated governance compliance', output: "Validated remediation plan. Confirmed aligned with CIS AWS Foundations Benchmark 1.4.", latency_ms: 65, tokens_consumed: 14 },
      { timestamp: '10:04:16', agent: 'RemediationAgent', action: 'Generated AWS CLI command payload', output: "Command generated: 'aws s3api put-public-access-block --bucket s3-bucket-01 --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'", latency_ms: 80, tokens_consumed: 16 }
    ]
  });

  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend health & fetch list
  const checkBackend = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        setBackendOnline(true);
        fetchIncidents();
        fetchMetrics();
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/incidents`);
      const data = await res.json();
      setIncidents(data);
    } catch {}
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/metrics`);
      const data = await res.json();
      setMetrics(data);
    } catch {}
  };

  const fetchTraces = async (id: string) => {
    if (backendOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/incidents/${id}/trace`);
        const data = await res.json();
        setTraces(data);
      } catch {}
    } else {
      setTraces(mockTraces[id] || []);
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, [backendOnline]);

  useEffect(() => {
    if (selectedIncidentId) {
      fetchTraces(selectedIncidentId);
    }
  }, [selectedIncidentId]);

  // Handle Event Simulation injection
  const handleSimulate = async () => {
    if (backendOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/events/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: activeSimulation,
            details: `Simulated ${activeSimulation} event details.`
          })
        });
        const data = await res.json();
        fetchIncidents();
        setSelectedIncidentId(data.incident_id);
      } catch {}
    } else {
      // Mock flow simulation locally
      const id = `inc-${Math.random().toString(36).substr(2, 9)}`;
      const newInc: Incident = {
        id,
        event_type: activeSimulation,
        details: `Local mock details for ${activeSimulation}.`,
        status: 'PENDING_APPROVAL',
        risk_score: activeSimulation.includes('S3') || activeSimulation.includes('IAM') ? 0.85 : 0.45,
        cost_estimate: activeSimulation.includes('EC2') ? 142.50 : 0.00,
        remediation_plan: activeSimulation.includes('S3') 
          ? 'Revoke public policy on S3 bucket. Apply block public access configuration.'
          : activeSimulation.includes('EC2')
          ? 'Halt over-provisioned instance nodes to save budget.'
          : 'Revoke insecure security group port configuration.',
        created_at: new Date().toLocaleTimeString()
      };

      const newTraces: Trace[] = [
        { timestamp: new Date().toLocaleTimeString(), agent: 'ArchitectAgent', action: 'Classified event signal', output: `Routed incident type: '${activeSimulation}' to specialists.`, latency_ms: 30, tokens_consumed: 10 },
        { timestamp: new Date().toLocaleTimeString(), agent: activeSimulation.includes('EC2') ? 'CostAgent' : 'SecurityAgent', action: 'Checked resource telemetry configs', output: `Detected threshold anomaly: ${newInc.details}`, latency_ms: 95, tokens_consumed: 16 },
        { timestamp: new Date().toLocaleTimeString(), agent: 'RAGKnowledgeAgent', action: 'Queried compliance database', output: 'Retrieved matching corporate compliance policy document.', latency_ms: 120, tokens_consumed: 22 },
        { timestamp: new Date().toLocaleTimeString(), agent: 'ComplianceAgent', action: 'Verified safety restrictions', output: 'Checked permission benchmarks. Confirmed action is safe to recommend.', latency_ms: 55, tokens_consumed: 12 },
        { timestamp: new Date().toLocaleTimeString(), agent: 'RemediationAgent', action: 'Generated AWS command payload', output: `Drafted CLI payload: ${newInc.remediation_plan}`, latency_ms: 70, tokens_consumed: 14 }
      ];

      setMockIncidents([newInc, ...mockIncidents]);
      setMockTraces(prev => ({...prev, [id]: newTraces}));
      setSelectedIncidentId(id);
    }
  };

  // Handle Approvals Override
  const handleApproval = async (approved: boolean) => {
    if (!selectedIncidentId) return;

    if (backendOnline) {
      try {
        await fetch(`${BACKEND_URL}/approval/${selectedIncidentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved, operator: operatorName })
        });
        fetchIncidents();
        fetchMetrics();
        // Force refresh trace
        fetchTraces(selectedIncidentId);
      } catch {}
    } else {
      // Mock locally
      setMockIncidents(prev => prev.map(inc => {
        if (inc.id === selectedIncidentId) {
          return { ...inc, status: approved ? 'REMEDIATED' : 'ABORTED' };
        }
        return inc;
      }));

      const finalTrace: Trace[] = [
        ...(mockTraces[selectedIncidentId] || []),
        {
          timestamp: new Date().toLocaleTimeString(),
          agent: 'RemediationWorker',
          action: approved ? 'Executing AWS CLI command' : 'Aborting remediation task',
          output: approved ? 'Remediation successfully applied to AWS resources.' : 'Remediation plan canceled by Operator override.',
          latency_ms: 85,
          tokens_consumed: 15
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          agent: 'ObservabilityAgent',
          action: 'Closed incident trace telemetry',
          output: 'Saved final status trail to logs database.',
          latency_ms: 40,
          tokens_consumed: 8
        }
      ];

      setMockTraces(prev => ({...prev, [selectedIncidentId]: finalTrace}));
      setTraces(finalTrace);
    }
  };

  const activeIncidentsList = backendOnline ? incidents : mockIncidents;
  const selectedIncident = activeIncidentsList.find(inc => inc.id === selectedIncidentId);

  // Compute mock-level metrics
  const activeMetrics = backendOnline ? metrics : {
    total_incidents: activeIncidentsList.length,
    active_incidents: activeIncidentsList.filter(inc => inc.status === 'PENDING_APPROVAL').length,
    remediated_incidents: activeIncidentsList.filter(inc => inc.status === 'REMEDIATED').length,
    total_tokens_consumed: Object.values(mockTraces).flat().reduce((acc, curr) => acc + curr.tokens_consumed, 0),
    total_cost_saved_usd: +(Object.values(mockTraces).flat().reduce((acc, curr) => acc + curr.tokens_consumed, 0) * 0.0015 / 1000.0 * 0.4).toFixed(4)
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between p-6">
      
      {/* Top Banner Header */}
      <header className="glass rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-4 h-4 rounded-full bg-brand-blue animate-pulse" />
            <h1 className="font-heading font-extrabold text-xl md:text-2xl uppercase tracking-wider">
              AWS Agentic Operations Command Center
            </h1>
          </div>
          <p className="text-brand-lightgray text-xs mt-1 font-light">
            Cloud Incident Investigation, Policy RAG, & Cost-Aware Remediation Stack
          </p>
        </div>

        {/* Server Connection Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-brand-green' : 'bg-brand-yellow'}`} />
            <span className="text-brand-lightgray font-mono">
              {backendOnline ? 'Live AWS Backend Online' : 'Local Sandbox Mode'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Workspace Panel: Simulation Control & Incident Queue */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Simulation Injector */}
          <div className="glass rounded-lg p-6">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-blue mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Simulate Event Trigger
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-brand-lightgray mb-2 font-mono">Select Cloud Alert</label>
                <select 
                  value={activeSimulation}
                  onChange={(e) => setActiveSimulation(e.target.value)}
                  className="w-full bg-[#0b0b0b] border border-white/10 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-blue transition"
                >
                  <option value="Public S3 Storage Bucket Detected">Public S3 Storage Bucket Detected</option>
                  <option value="Over-Permissive IAM Policy">Over-Permissive IAM Policy</option>
                  <option value="EC2 Daily Billing Anomaly">EC2 Daily Billing Anomaly</option>
                  <option value="Insecure Security Group Port (0.0.0.0/0)">Insecure Security Group Port (0.0.0.0/0)</option>
                </select>
              </div>

              <button
                onClick={handleSimulate}
                className="w-full py-3 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/45 hover:border-brand-blue text-brand-blue text-xs font-semibold rounded transition flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Inject Signal</span>
              </button>
            </div>
          </div>

          {/* Incidents List Queue */}
          <div className="glass rounded-lg p-6 flex-1 flex flex-col">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-violet mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Incidents queue
            </h2>

            <div className="space-y-3 overflow-y-auto flex-1 max-h-[350px] lg:max-h-none">
              {activeIncidentsList.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded border transition cursor-pointer text-left ${
                    selectedIncidentId === inc.id
                      ? 'bg-white/5 border-white/35'
                      : 'bg-[#0b0b0b] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-lightgray font-mono">{inc.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      inc.status === 'PENDING_APPROVAL' ? 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30' :
                      inc.status === 'REMEDIATED' ? 'bg-brand-green/10 text-brand-green border border-brand-green/30' :
                      inc.status === 'ABORTED' ? 'bg-brand-red/10 text-brand-red border border-brand-red/30' :
                      'bg-white/10 text-white border border-white/20'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white mt-2 leading-tight">
                    {inc.event_type}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-brand-lightgray mt-3">
                    <span className="flex items-center gap-1 font-mono">
                      Risk: {(inc.risk_score * 100).toFixed(0)}%
                    </span>
                    <span className="font-mono">${inc.cost_estimate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Workspace Panel: Detail traces, metrics, approvals */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Top Panel: Metrics Summary widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-brand-lightgray font-mono">Total Incidents</span>
              <p className="text-2xl font-heading font-extrabold text-white mt-1 font-mono">{activeMetrics.total_incidents}</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-brand-lightgray font-mono">Pending Approvals</span>
              <p className="text-2xl font-heading font-extrabold text-brand-yellow mt-1 font-mono">{activeMetrics.active_incidents}</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-brand-lightgray font-mono">Total Remediated</span>
              <p className="text-2xl font-heading font-extrabold text-brand-green mt-1 font-mono">{activeMetrics.remediated_incidents}</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-brand-lightgray font-mono">Cost Saved</span>
              <p className="text-2xl font-heading font-extrabold text-white mt-1 font-mono flex items-center justify-center gap-0.5">
                <DollarSign className="w-4 h-4 text-brand-green shrink-0" />
                <span className="font-mono">{activeMetrics.total_cost_saved_usd}</span>
              </p>
            </div>
          </div>

          {selectedIncident ? (
            <div className="flex-1 flex flex-col space-y-6">
              
              {/* Incident Details & Human Approvals override gate */}
              <div className="glass rounded-lg p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-extrabold text-lg text-white">Incident Details</h3>
                  <span className="text-xs text-brand-lightgray font-mono">Created: {selectedIncident.created_at}</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase text-brand-lightgray font-mono">Description</span>
                    <p className="text-sm text-white mt-1">{selectedIncident.details}</p>
                  </div>

                  <div>
                    <span className="text-xs uppercase text-brand-lightgray font-mono">Proposed Remediation Action</span>
                    <p className="text-sm text-brand-blue font-semibold mt-1">{selectedIncident.remediation_plan}</p>
                  </div>

                  {/* Human Gates */}
                  {selectedIncident.status === 'PENDING_APPROVAL' && (
                    <div className="p-4 rounded border border-brand-yellow/30 bg-brand-yellow/5 mt-4">
                      <h4 className="font-heading font-bold text-sm text-brand-yellow flex items-center gap-1.5 uppercase tracking-wide">
                        <UserCheck className="w-4 h-4 text-brand-yellow" />
                        Human Approval Awaiting Verification
                      </h4>
                      <p className="text-xs text-brand-lightgray mt-1">
                        Review the generated AWS CLI command above. Enter your operator signature and authorize the remediation code execution.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                        <input
                          type="text"
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          placeholder="Operator Name"
                          className="w-full sm:w-1/3 bg-black border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-yellow"
                        />
                        <button
                          onClick={() => handleApproval(true)}
                          className="w-full sm:w-auto px-4 py-2 bg-brand-green/20 hover:bg-brand-green/30 border border-brand-green/45 hover:border-brand-green text-brand-green text-xs font-semibold rounded transition"
                        >
                          Approve Execution
                        </button>
                        <button
                          onClick={() => handleApproval(false)}
                          className="w-full sm:w-auto px-4 py-2 bg-brand-red/20 hover:bg-brand-red/30 border border-brand-red/45 hover:border-brand-red text-brand-red text-xs font-semibold rounded transition"
                        >
                          Reject Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Agent Execution Timeline traces */}
              <div className="glass rounded-lg p-6 flex-1 flex flex-col text-left">
                <h3 className="font-heading font-extrabold text-lg text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-blue" />
                  Agent Execution Timeline Traces
                </h3>

                <div className="space-y-4 overflow-y-auto flex-1 max-h-[300px]">
                  {traces.map((trace, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs border-l border-white/10 pl-4 relative">
                      {/* Node Bullet */}
                      <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border ${
                        trace.agent.includes('Security') ? 'bg-brand-red border-brand-red' :
                        trace.agent.includes('Cost') ? 'bg-brand-yellow border-brand-yellow' :
                        trace.agent.includes('RAG') ? 'bg-brand-blue border-brand-blue' :
                        trace.agent.includes('Worker') ? 'bg-brand-green border-brand-green' :
                        'bg-brand-violet border-brand-violet'
                      }`} />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white font-mono">{trace.agent}</span>
                          <span className="text-brand-lightgray font-mono text-[10px]">{trace.timestamp}</span>
                        </div>
                        <p className="text-brand-lightgray font-mono mt-1 text-[11px]">
                          <strong>Action:</strong> {trace.action}
                        </p>
                        <div className="bg-[#080808] border border-white/5 p-2 rounded mt-1 font-mono text-[10px] text-green-400">
                          {trace.output}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[9px] text-white/40 font-mono">
                          <span>Latency: {trace.latency_ms}ms</span>
                          <span>Tokens: {trace.tokens_consumed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass rounded-lg p-12 flex-1 flex flex-col items-center justify-center text-center">
              <Database className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="font-heading font-bold text-lg text-white">No Incident Selected</h3>
              <p className="text-brand-lightgray text-sm max-w-sm mt-2">
                Inject a simulated event trigger or select an active incident card from the queue to inspect the multi-agent traces timeline.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
