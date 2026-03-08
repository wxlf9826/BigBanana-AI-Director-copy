import React from 'react';
import { Loader2, Search } from 'lucide-react';
import { NewApiLog, NewApiLogStats, NewApiStatus, NewApiTask } from '../../services/newApiService';
import { LogView } from './types';
import { formatDateTime, formatQuota } from './utils';
import { EmptyState, SectionCard, StatCard } from './ui';

interface LogsPanelProps {
  status: NewApiStatus | null;
  logView: LogView;
  setLogView: React.Dispatch<React.SetStateAction<LogView>>;
  logs: NewApiLog[];
  logsLoading: boolean;
  logStats: NewApiLogStats | null;
  logType: number;
  setLogType: React.Dispatch<React.SetStateAction<number>>;
  logStart: string;
  setLogStart: React.Dispatch<React.SetStateAction<string>>;
  logEnd: string;
  setLogEnd: React.Dispatch<React.SetStateAction<string>>;
  logChannelId: string;
  setLogChannelId: React.Dispatch<React.SetStateAction<string>>;
  logTokenName: string;
  setLogTokenName: React.Dispatch<React.SetStateAction<string>>;
  logModelName: string;
  setLogModelName: React.Dispatch<React.SetStateAction<string>>;
  logPage: number;
  logPageSize: number;
  logTotal: number;
  onUsageSearch: () => Promise<void>;
  onUsagePageChange: (page: number) => Promise<void>;
  tasks: NewApiTask[];
  tasksLoading: boolean;
  taskStart: string;
  setTaskStart: React.Dispatch<React.SetStateAction<string>>;
  taskEnd: string;
  setTaskEnd: React.Dispatch<React.SetStateAction<string>>;
  taskTaskId: string;
  setTaskTaskId: React.Dispatch<React.SetStateAction<string>>;
  taskStatus: string;
  setTaskStatus: React.Dispatch<React.SetStateAction<string>>;
  taskPlatform: string;
  setTaskPlatform: React.Dispatch<React.SetStateAction<string>>;
  taskPage: number;
  taskPageSize: number;
  taskTotal: number;
  onTaskSearch: () => Promise<void>;
  onTaskPageChange: (page: number) => Promise<void>;
}

const inputClassName = 'border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--border-secondary)]';

const formatTaskDuration = (submitTime?: number, finishTime?: number) => {
  if (!submitTime || !finishTime || finishTime < submitTime) return '鈥?;
  const totalSeconds = Math.max(0, Math.floor(finishTime - submitTime));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const normalizeTaskStatus = (value?: string) => {
  switch (String(value || '').toUpperCase()) {
    case 'NOT_START':
      return { label: '鏈紑濮?, className: 'bg-slate-500/10 text-slate-300 border border-slate-500/30' };
    case 'SUBMITTED':
    case 'QUEUED':
      return { label: '鎺掗槦涓?, className: 'bg-sky-500/10 text-sky-300 border border-sky-500/30' };
    case 'IN_PROGRESS':
      return { label: '杩涜涓?, className: 'bg-amber-500/10 text-amber-300 border border-amber-500/30' };
    case 'SUCCESS':
      return { label: '鎴愬姛', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' };
    case 'FAILURE':
      return { label: '澶辫触', className: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' };
    default:
      return { label: value || '鏈煡', className: 'bg-slate-500/10 text-slate-300 border border-slate-500/30' };
  }
};

const parseProgressValue = (value?: string) => {
  if (!value) return null;
  const raw = String(value).trim();
  const normalized = raw.endsWith('%') ? raw.slice(0, -1) : raw;
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return null;
  if (numeric <= 1 && raw.includes('.')) {
    return Math.max(0, Math.min(100, Math.round(numeric * 100)));
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const TaskProgress: React.FC<{ status?: string; progress?: string }> = ({ status, progress }) => {
  const percent = parseProgressValue(progress);
  if (percent === null) {
    return <span className="text-sm text-[var(--text-secondary)]">{progress || '鈥?}</span>;
  }

  const barClassName = String(status || '').toUpperCase() === 'FAILURE' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="flex min-w-[160px] items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-hover)]">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="whitespace-nowrap text-xs font-medium text-[var(--text-secondary)]">{percent}%</span>
    </div>
  );
};

export const LogsPanel: React.FC<LogsPanelProps> = ({
  status,
  logView,
  setLogView,
  logs,
  logsLoading,
  logStats,
  logType,
  setLogType,
  logStart,
  setLogStart,
  logEnd,
  setLogEnd,
  logChannelId,
  setLogChannelId,
  logTokenName,
  setLogTokenName,
  logModelName,
  setLogModelName,
  logPage,
  logPageSize,
  logTotal,
  onUsageSearch,
  onUsagePageChange,
  tasks,
  tasksLoading,
  taskStart,
  setTaskStart,
  taskEnd,
  setTaskEnd,
  taskTaskId,
  setTaskTaskId,
  taskStatus,
  setTaskStatus,
  taskPlatform,
  setTaskPlatform,
  taskPage,
  taskPageSize,
  taskTotal,
  onTaskSearch,
  onTaskPageChange,
}) => {
  return (
    <div className="space-y-6">
      <SectionCard
        title={logView === 'usage' ? '浣跨敤鏃ュ織' : '浠诲姟鏃ュ織'}
        description={logView === 'usage'
          ? '鎸夋椂闂淬€佷护鐗屻€佹ā鍨嬪拰娓犻亾绛涢€夊悗锛屽揩閫熺‘璁ゆ秷璐逛笌鎶ラ敊鏉ユ簮銆?
          : '鏌ョ湅寮傛浠诲姟鐨勬彁浜ゆ椂闂淬€佹墽琛岃繘搴︺€佷换鍔＄姸鎬佷笌缁撴灉閾炬帴銆?}
        action={(
          <button
            onClick={logView === 'usage' ? () => void onUsageSearch() : () => void onTaskSearch()}
            disabled={logView === 'usage' ? logsLoading : tasksLoading}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-60"
          >
            {(logView === 'usage' ? logsLoading : tasksLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {logView === 'usage' ? '鏌ヨ浣跨敤鏃ュ織' : '鏌ヨ浠诲姟鏃ュ織'}
          </button>
        )}
      >
        <div className="space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLogView('usage')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${logView === 'usage' ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)]' : 'bg-transparent text-[var(--text-tertiary)] border-[var(--border-primary)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)]'}`}
            >
              浣跨敤鏃ュ織
            </button>
            <button
              type="button"
              onClick={() => setLogView('tasks')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${logView === 'tasks' ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)]' : 'bg-transparent text-[var(--text-tertiary)] border-[var(--border-primary)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)]'}`}
            >
              浠诲姟鏃ュ織
            </button>
          </div>

          {logView === 'usage' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <select
                value={logType}
                onChange={(event) => setLogType(Number(event.target.value))}
                className={inputClassName}
              >
                <option value={2}>娑堣垂鏃ュ織</option>
                <option value={4}>閿欒鏃ュ織</option>
                <option value={5}>绯荤粺鏃ュ織</option>
                <option value={1}>鍏呭€兼棩蹇?/option>
              </select>
              <input
                type="datetime-local"
                value={logStart}
                onChange={(event) => setLogStart(event.target.value)}
                className={inputClassName}
              />
              <input
                type="datetime-local"
                value={logEnd}
                onChange={(event) => setLogEnd(event.target.value)}
                className={inputClassName}
              />
              <input
                value={logChannelId}
                onChange={(event) => setLogChannelId(event.target.value)}
                placeholder="鎸夋笭閬?ID 绛涢€?
                className={inputClassName}
              />
              <input
                value={logTokenName}
                onChange={(event) => setLogTokenName(event.target.value)}
                placeholder="鎸変护鐗屽悕绉扮瓫閫?
                className={inputClassName}
              />
              <input
                value={logModelName}
                onChange={(event) => setLogModelName(event.target.value)}
                placeholder="鎸夋ā鍨嬪悕绉扮瓫閫?
                className={inputClassName}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <input
                type="datetime-local"
                value={taskStart}
                onChange={(event) => setTaskStart(event.target.value)}
                className={inputClassName}
              />
              <input
                type="datetime-local"
                value={taskEnd}
                onChange={(event) => setTaskEnd(event.target.value)}
                className={inputClassName}
              />
              <input
                value={taskTaskId}
                onChange={(event) => setTaskTaskId(event.target.value)}
                placeholder="鎸変换鍔?ID 绛涢€?
                className={inputClassName}
              />
              <input
                value={taskPlatform}
                onChange={(event) => setTaskPlatform(event.target.value)}
                placeholder="鎸夊钩鍙扮瓫閫夛紝渚嬪 openai"
                className={inputClassName}
              />
              <select
                value={taskStatus}
                onChange={(event) => setTaskStatus(event.target.value)}
                className={inputClassName}
              >
                <option value="">鍏ㄩ儴鐘舵€?/option>
                <option value="NOT_START">鏈紑濮?/option>
                <option value="SUBMITTED">宸叉彁浜?/option>
                <option value="QUEUED">鎺掗槦涓?/option>
                <option value="IN_PROGRESS">杩涜涓?/option>
                <option value="SUCCESS">鎴愬姛</option>
                <option value="FAILURE">澶辫触</option>
              </select>
            </div>
          )}
        </div>
      </SectionCard>

      {logView === 'usage' ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="娑堣垂棰濆害" value={formatQuota(logStats?.quota, status)} hint="褰撳墠绛涢€夋潯浠朵笅鐨勬€绘秷鑰? />
            <StatCard label="RPM" value={logStats?.rpm ?? 0} hint="姣忓垎閽熻姹傞€熺巼" />
            <StatCard label="TPM" value={logStats?.tpm ?? 0} hint="姣忓垎閽?Token 娑堣€楅噺" />
          </div>

          <SectionCard title="鏃ュ織鏄庣粏" description="淇濈暀鏃堕棿銆佷护鐗屻€佹ā鍨嬪拰杈撳叆杈撳嚭锛屾柟渚垮揩閫熺‘璁ゆ秷鑰楁潵婧愩€?>
            {logsLoading ? (
              <div className="flex min-h-[240px] items-center justify-center text-[var(--text-tertiary)]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <EmptyState title="鏆傛棤鏃ュ織" description="浣犲彲浠ュ厛璋冩暣鏃堕棿鑼冨洿銆佷护鐗屽悕绉般€佹ā鍨嬪悕绉版垨娓犻亾 ID锛屽啀閲嶆柊鏌ヨ銆? />
            ) : (
              <div className="max-h-[70vh] overflow-auto border border-[var(--border-primary)]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">鏃堕棿</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">浠ょ墝</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">妯″瀷</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">杈撳叆 / 杈撳嚭</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">鑺辫垂</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-[var(--border-primary)] align-top">
                        <td className="whitespace-nowrap px-4 py-3">{formatDateTime(log.created_at)}</td>
                        <td className="px-4 py-3">{log.token_name || '鈥?}</td>
                        <td className="px-4 py-3">{log.model_name || '鈥?}</td>
                        <td className="whitespace-nowrap px-4 py-3">{log.prompt_tokens ?? 0} / {log.completion_tokens ?? 0}</td>
                        <td className="whitespace-nowrap px-4 py-3">{formatQuota(log.quota, status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {logTotal > logPageSize && (
              <div className="mt-5 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                <span>绗?{logPage} / {usageTotalPages} 椤碉紝鍏?{logTotal} 鏉?/span>
                <div className="flex gap-2">
                  <button
                    onClick={() => void onUsagePageChange(Math.max(1, logPage - 1))}
                    disabled={logPage <= 1}
                    className="border border-[var(--border-primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)] transition-colors disabled:opacity-40"
                  >
                    涓婁竴椤?                  </button>
                  <button
                    onClick={() => void onUsagePageChange(Math.min(usageTotalPages, logPage + 1))}
                    disabled={logPage >= usageTotalPages}
                    className="border border-[var(--border-primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)] transition-colors disabled:opacity-40"
                  >
                    涓嬩竴椤?                  </button>
                </div>
              </div>
            )}
          </SectionCard>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="浠诲姟鎬绘暟" value={taskTotal} hint="褰撳墠绛涢€夋潯浠朵笅鐨勬€讳换鍔℃暟" />
            <StatCard label="鏈〉鎴愬姛" value={taskSuccessCount} hint="褰撳墠鍒楄〃涓殑宸插畬鎴愪换鍔? />
            <StatCard label="鏈〉杩涜涓? value={taskRunningCount} hint="褰撳墠鍒楄〃涓殑鎺掗槦鎴栨墽琛屼腑浠诲姟" />
            <StatCard label="鏈〉澶辫触" value={taskFailureCount} hint="褰撳墠鍒楄〃涓殑澶辫触浠诲姟" />
          </div>

          <SectionCard title="浠诲姟鏄庣粏" description="鏀寔鏌ョ湅寮傛浠诲姟鐨勭姸鎬併€佽繘搴︺€佽€楁椂鍜岀粨鏋滈摼鎺ャ€?>
            {tasksLoading ? (
              <div className="flex min-h-[240px] items-center justify-center text-[var(--text-tertiary)]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState title="鏆傛棤浠诲姟" description="浣犲彲浠ュ厛璋冩暣鏃堕棿鑼冨洿銆佷换鍔?ID銆佸钩鍙版垨鐘舵€侊紝鍐嶉噸鏂版煡璇€? />
            ) : (
              <div className="max-h-[70vh] overflow-auto border border-[var(--border-primary)]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">鎻愪氦鏃堕棿</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">瀹屾垚鏃堕棿</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">鑰楁椂</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">骞冲彴</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">绫诲瀷</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">浠诲姟 ID</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">浠诲姟鐘舵€?/th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">杩涘害</th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">璇︽儏</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const statusMeta = normalizeTaskStatus(task.status);
                      const resultUrl = typeof task.result_url === 'string' && /^https?:\/\//.test(task.result_url) ? task.result_url : '';
                      return (
                        <tr key={task.id} className="border-t border-[var(--border-primary)] align-top">
                          <td className="whitespace-nowrap px-4 py-3">{formatDateTime(task.submit_time)}</td>
                          <td className="whitespace-nowrap px-4 py-3">{formatDateTime(task.finish_time)}</td>
                          <td className="whitespace-nowrap px-4 py-3">{formatTaskDuration(task.submit_time, task.finish_time)}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono text-emerald-400">
                              {normalizePlatform(task.platform)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">{normalizeTaskAction(task.action)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                            <div className="max-w-[320px] truncate whitespace-nowrap" title={task.task_id || '鈥?}>{task.task_id || '鈥?}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${statusMeta.className}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <TaskProgress status={task.status} progress={task.progress} />
                          </td>
                          <td className="px-4 py-3">
                            {resultUrl ? (
                              <span className="text-[var(--text-secondary)]">已完成</span>
                            ) : task.fail_reason ? (
                              <span className="block max-w-[240px] truncate text-rose-400" title={task.fail_reason}>
                                {task.fail_reason}
                              </span>
                            ) : (
                              <span className="text-[var(--text-tertiary)]">鈥?/span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {taskTotal > taskPageSize && (
              <div className="mt-5 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                <span>绗?{taskPage} / {taskTotalPages} 椤碉紝鍏?{taskTotal} 鏉?/span>
                <div className="flex gap-2">
                  <button
                    onClick={() => void onTaskPageChange(Math.max(1, taskPage - 1))}
                    disabled={taskPage <= 1}
                    className="border border-[var(--border-primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)] transition-colors disabled:opacity-40"
                  >
                    涓婁竴椤?                  </button>
                  <button
                    onClick={() => void onTaskPageChange(Math.min(taskTotalPages, taskPage + 1))}
                    disabled={taskPage >= taskTotalPages}
                    className="border border-[var(--border-primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)] transition-colors disabled:opacity-40"
                  >
                    涓嬩竴椤?                  </button>
                </div>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
};
