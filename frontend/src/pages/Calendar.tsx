// frontend/src/pages/Calendar.tsx
// ----------------------------------------------------------
// 서버 경유(게이트웨이 → schedule:8086)로 Google Calendar 연동
// - 프론트는 더 이상 GIS 스크립트/액세스 토큰을 직접 다루지 않음
// - "연결 상태 확인 → 캘린더 목록 → 이벤트 조회" 모두 schedule API 사용
// ----------------------------------------------------------

import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// schedule 전용 API 모듈 (이미 작성한 api.ts의 모듈)
import {
  scheduleGoogleAPI,
  type GoogleCalendarItem,
} from '@/services/api';

// .env (Vite) - 공개 캘린더(공휴일)만 API Key로 유지
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const HOLIDAY_CAL_ID = import.meta.env.VITE_GOOGLE_CAL_HOLIDAY_ID as string;

// 공개 캘린더 소스 (API Key로만 동작)
const PUBLIC_SOURCES = [
  {
    id: 'holiday',
    googleCalendarId: HOLIDAY_CAL_ID,
    color: '#b91c1c', // 공휴일
    textColor: '#fff',
  },
];

// 타입들(사이드패널에 표시할 축약형)
type SideEvent = {
  id: string;
  title: string;
  description: string;
  time: string; // "HH:mm" or '종일'
  location: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  startDate: Date | null;
};

const Calendar: React.FC = () => {
  // ===== 서버 연동 상태 =====
  const [isConnected, setIsConnected] = useState(false);     // 구글 연동(토큰 저장) 여부
  const [connecting, setConnecting] = useState(false);      // connect 버튼 중복 클릭 방지
  const [isInitializing, setIsInitializing] = useState(true); // 최초 상태 확인 중

  // ===== 사용자 계정 내 캘린더 목록 & 선택 =====
  const [calendarList, setCalendarList] = useState<GoogleCalendarItem[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');

  // ===== 사이드패널용 이벤트 상태 (선택된 개인 캘린더 기준) =====
  const [googleEvents, setGoogleEvents] = useState<SideEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SideEvent | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // 자동 새로고침 간격 (5분)
  const REFRESH_INTERVAL = 5 * 60 * 1000;

  // ===== 날짜 범위 유틸 =====
  const getWeekRange = () => {
    const now = new Date();
    const weekStart = new Date(now);
    const dow = now.getDay(); // 0(일)~6(토)
    const daysToMonday = dow === 0 ? 6 : dow - 1;
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  };

  const getTodayRange = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return { todayStart, todayEnd };
  };

  const isSameDate = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const isDateInRange = (date: Date, start: Date, end: Date) =>
    date >= start && date <= end;

  // ===== 초기: 서버 저장 토큰 유무 확인 =====
  useEffect(() => {
    (async () => {
      try {
        const status = await scheduleGoogleAPI.status(); // { connected, email? }
        setIsConnected(status.connected);
        if (status.connected) {
          await loadCalendarList();
          await fetchGoogleEvents();
        }
      } catch {
        // noop
      } finally {
        setIsInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 구글 계정 연동(팝업) =====
  const connectGoogle = async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      const returnTo = `${window.location.origin}/calendar`; // 인증 후 복귀
      const { url } = await scheduleGoogleAPI.authUrl(returnTo);
      console.log(url)

      // URL이 유효한지 확인하는 로직 추가
      if (!url || url.length < 10) {
        console.error('인증 URL이 유효하지 않습니다.');
        alert('Google 인증 URL을 가져오지 못했습니다. 서버 상태를 확인해주세요.');
        setConnecting(false);
        return; // 팝업을 열지 않고 함수 종료
      }
      
      // 정상적인 URL일 경우에만 팝업을 엽니다.
      const w = window.open(
        url,
        'google-oauth',
        'width=520,height=640,menubar=no,toolbar=no,location=no,status=no'
      );

      const timer = setInterval(async () => {
        if (!w || w.closed) {
          clearInterval(timer);
          const status = await scheduleGoogleAPI.status();
          setIsConnected(status.connected);
          if (status.connected) {
            await loadCalendarList();
            await fetchGoogleEvents();
          }
          setConnecting(false);
        }
      }, 800);
    } catch(error) {
      console.error('Google 인증 URL 요청 중 오류 발생:', error);
      alert('Google 인증 URL 요청에 실패했습니다. 서버 로그를 확인해주세요.');
      setConnecting(false);
    }
  };

  // ===== 캘린더 목록 로드(서버 경유) =====
  const loadCalendarList = async () => {
    try {
      const list = await scheduleGoogleAPI.calendars();
      setCalendarList(list);

      // 기본 선택 캘린더 설정 (owner 우선, 없으면 primary 유지)
      const owner = list.find((c) => c.accessRole === 'owner');
      if (owner?.id) setSelectedCalendarId(owner.id);
    } catch {
      setCalendarList([]);
    }
  };

  // ===== 개인 캘린더: 주간 이벤트 불러오기(사이드패널) - 서버 경유 =====
  const fetchGoogleEvents = async () => {
    try {
      setIsLoading(true);
      if (!isConnected) {
        setGoogleEvents([]);
        return;
      }

      const { weekStart, weekEnd } = getWeekRange();
      const calId = selectedCalendarId || 'primary';
      const data = await scheduleGoogleAPI.events({
        calendarId: calId,
        timeMin: weekStart.toISOString(),
        timeMax: weekEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      });

      const events: SideEvent[] = (data.items || []).map((item: any, index: number) => {
        const startISO = item.start?.dateTime || item.start?.date;
        const endISO = item.end?.dateTime || item.end?.date;
        const startDate = startISO ? new Date(startISO) : null;

        // 종일 여부
        let timeDisplay = '종일';
        if (item.start?.dateTime) {
          timeDisplay = new Date(item.start.dateTime).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }

        return {
          id: item.id ?? `google-${index}`,
          title: item.summary || '제목 없음',
          description: item.description || '',
          time: timeDisplay,
          location: item.location || '장소 없음',
          startTime: startISO || '',
          endTime: endISO || '',
          startDate,
        };
      });

      setGoogleEvents(events);
      setLastRefreshTime(new Date());
    } catch {
      setGoogleEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 + 5분마다 자동 새로고침 (연동/선택 캘린더 바뀌면 재설정)
  useEffect(() => {
    if (!isConnected) return;
    fetchGoogleEvents();
    const id = setInterval(fetchGoogleEvents, REFRESH_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedCalendarId]);

  // ✅ 팝업에서 오는 postMessage 처리(useEffect 추가)
  useEffect(() => {
    const onMessage = async (e: MessageEvent) => {
      const data = e?.data;
      if (!data) return;

      // 성공
      if (data === 'google-linked' || (typeof data === 'object' && data.type === 'google-linked')) {
        // 버튼 상태/중복 클릭 방지 해제
        setConnecting(false);

        // 가장 확실하게 서버 상태 재확인
        try {
          const status = await scheduleGoogleAPI.status();
          setIsConnected(status.connected);
          if (status.connected) {
            await loadCalendarList();
            await fetchGoogleEvents();
          }
        } catch {
          // ignore
        }

        // 콜백이 준 returnTo가 있으면 이동(다르면 redirect, 같으면 stay)
        const returnTo = typeof data === 'object' ? data.returnTo : undefined;
        if (typeof returnTo === 'string' && returnTo.length > 0) {
          try {
            const url = new URL(returnTo, window.location.origin);
            if (url.href !== window.location.href) {
              window.location.href = url.href;
              return;
            }
          } catch { /* malformed returnTo → 무시 */ }
        }
        // 같은 페이지면 소프트 새로고침 효과
        await fetchGoogleEvents();
        return;
      }

      // 실패
      if (data === 'google-failed' || (typeof data === 'object' && data.type === 'google-failed')) {
        setConnecting(false);
        alert('구글 연동에 실패했습니다. 다시 시도해 주세요.');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== FullCalendar eventSources (개인 소스는 서버 경유) =====
  const personalSource = useMemo(
    () => ({
      id: 'my-calendar',
      color: '#4682B4',
      textColor: '#fff',
      events: async (info: any, success: any, failure: any) => {
        try {
          if (!isConnected) {
            success([]);
            return;
          }
          const calId = selectedCalendarId || 'primary';
          const data = await scheduleGoogleAPI.events({
            calendarId: calId,
            timeMin: new Date(info.startStr).toISOString(),
            timeMax: new Date(info.endStr).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 2500,
          });

          const fcEvents = (data.items || []).map((e: any) => ({
            id: e.id,
            title: e.summary || '(제목 없음)',
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            extendedProps: {
              location: e.location || '',
              description: e.description || '',
            },
          }));
          success(fcEvents);
        } catch (err) {
          failure(err);
        }
      },
    }),
    [isConnected, selectedCalendarId]
  );

  const eventSources = useMemo(
    () => [
      ...PUBLIC_SOURCES, // 공개 캘린더(공휴일): plugin + API KEY
      personalSource,    // 개인 캘린더(비공개): 서버 경유
    ],
    [personalSource]
  );

  // ===== 유틸 =====
  const { todayStart, todayEnd } = getTodayRange();
  const { weekStart, weekEnd } = getWeekRange();

  const myCalEvents = googleEvents;

  const myCalEventsToday = useMemo(() => {
    const todayEvents = myCalEvents.filter((ev) => {
      if (!ev.startDate) return false;
      if (ev.time === '종일') {
        return isSameDate(ev.startDate, new Date());
      }
      return isDateInRange(ev.startDate, todayStart, todayEnd);
    });
    return todayEvents.sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));
  }, [myCalEvents, todayStart, todayEnd]);

  const myCalEventsThisWeek = useMemo(() => {
    const weekEvents = myCalEvents.filter((ev) => {
      if (!ev.startDate) return false;
      return isDateInRange(ev.startDate, weekStart, weekEnd);
    });
    return weekEvents.sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));
  }, [myCalEvents, weekStart, weekEnd]);

  const fmtTime = (timeStr: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const openDetailDialog = (event: SideEvent) => {
    setSelectedEvent(event);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {!isConnected && (
            <Button onClick={connectGoogle} disabled={connecting}>
              {connecting ? '연결 중...' : 'Google 계정 연동하기'}
            </Button>
          )}
        </div>
        <h1 className="text-3xl font-bold mt-4 mb-2">캘린더</h1>
        <p className="text-muted-foreground">일정을 관리하고 팀 미팅을 확인하세요.</p>
        <p className="text-xs text-muted-foreground mt-1">
          마지막 업데이트: {lastRefreshTime.toLocaleTimeString('ko-KR')}
        </p>

        {/* 초기화 중 표시 */}
        {isInitializing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">구글 캘린더 연결 상태를 확인하는 중...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        <div className="lg:col-span-5">
          <Card>
            <CardContent>
              <div className="rounded-md border fullcalendar-wrapper">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin, googleCalendarPlugin]}
                  initialView="dayGridMonth"
                  eventSources={eventSources}
                  googleCalendarApiKey={GOOGLE_API_KEY} // 공개 캘린더용
                  height="auto"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                  locale="ko"
                  buttonText={{ today: 'today', prev: '<', next: '>' }}
                  eventDisplay="block"
                  eventContent={(arg) => {
                    const title = arg.event.title || '';
                    const shortTitle = title.length > 6 ? title.substring(0, 6) + '..' : title;
                    // holiday 색상 유지, 개인 소스는 personalSource.color 적용됨
                    const color =
                      (arg.event.source as any)?.internalEventSource?._raw?.color || '#666';
                    return {
                      html: `<div style="font-size:12px;font-weight:500;color:#fff;text-align:center;line-height:1.2;word-wrap:break-word;max-width:100%;background-color:${color};padding:2px 4px;border-radius:3px;">${shortTitle}</div>`,
                    };
                  }}
                  datesSet={() => {}}
                  eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    if (info.event.url) {
                      window.open(info.event.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* 오늘의 일정 */}
          <Card>
            <CardHeader>
              <CardTitle>오늘의 일정 추천</CardTitle>
              <CardDescription>
                AI가 추천한 {new Date().toLocaleDateString()} 일정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">일정을 불러오는 중...</div>
                ) : myCalEventsToday.length === 0 ? (
                  <div className="text-sm text-muted-foreground">오늘 일정이 없습니다.</div>
                ) : (
                  myCalEventsToday.map((ev) => (
                    <div key={ev.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{ev.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {ev.startTime && ev.endTime
                              ? `${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}`
                              : ev.time}
                            {ev.location && ev.location !== '장소 없음' && (
                              <span className="ml-2">• {ev.location}</span>
                            )}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openDetailDialog(ev)}>
                          <Eye className="h-4 w-4 mr-1" />
                          상세보기
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 이번 주 일정 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 주 일정 추천</CardTitle>
              <CardDescription>
                {weekStart.toLocaleDateString()} ~ {weekEnd.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">일정을 불러오는 중...</div>
                ) : myCalEventsThisWeek.length === 0 ? (
                  <div className="text-sm text-muted-foreground">이번 주 일정이 없습니다.</div>
                ) : (
                  myCalEventsThisWeek.map((ev) => (
                    <div key={ev.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{ev.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {ev.startDate?.toLocaleDateString()} •{' '}
                            {ev.startTime && ev.endTime
                              ? `${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}`
                              : ev.time}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openDetailDialog(ev)}>
                          <Eye className="h-4 w-4 mr-1" />
                          상세보기
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 상세보기 다이얼로그 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>일정 상세 정보</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">날짜 및 시간</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedEvent.startDate?.toLocaleDateString()} •{' '}
                  {selectedEvent.startTime && selectedEvent.endTime
                    ? `${fmtTime(selectedEvent.startTime)} - ${fmtTime(selectedEvent.endTime)}`
                    : selectedEvent.time}
                </div>
              </div>
              {selectedEvent.location && selectedEvent.location !== '장소 없음' && (
                <div>
                  <h4 className="font-semibold mb-2">장소</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </div>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold mb-2">일정 설명</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;