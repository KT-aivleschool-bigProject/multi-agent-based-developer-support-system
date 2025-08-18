import React, { useEffect, useMemo, useRef, useState } from 'react';
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

// ✅ .env (Vite)
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string; // 공개 캘린더용
const HOLIDAY_CAL_ID = import.meta.env.VITE_GOOGLE_CAL_HOLIDAY_ID as string;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string; // OAuth 클라이언트 ID(환경별 공용)

// ✅ 스코프: 로그인 사용자 이메일 + 캘린더 읽기 전용
const SCOPES = 'openid email https://www.googleapis.com/auth/calendar.readonly';

// 공개 캘린더 소스 (API Key로만 동작)
const PUBLIC_SOURCES = [
  {
    id: 'holiday',
    googleCalendarId: HOLIDAY_CAL_ID,
    color: '#b91c1c', // 공휴일
    textColor: '#fff',
  },
];

// 타입들
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

type CalendarListItem = { id: string; summary: string; accessRole: string };
type TokenClient = ReturnType<any>;

const GOOGLE_CALENDAR_TOKENS_KEY = 'google_calendar_tokens'; // 구글 캘린더용 OAuth 토큰

// 구글 OAuth 토큰 정보 타입
type GoogleTokenInfo = {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // 만료 시간 (timestamp)
  user_email: string;
  scope: string;
};

// 구글 토큰 관리 함수들
const GoogleTokenManager = {
  // 토큰 저장
  save: (tokenInfo: GoogleTokenInfo) => {
    try {
      localStorage.setItem(GOOGLE_CALENDAR_TOKENS_KEY, JSON.stringify(tokenInfo));
    } catch {
    }
  },

  // 토큰 복원
  get: (): GoogleTokenInfo | null => {
    try {
      const stored = localStorage.getItem(GOOGLE_CALENDAR_TOKENS_KEY);
      if (!stored) return null;
      
      const tokenInfo: GoogleTokenInfo = JSON.parse(stored);
      
      // 토큰이 만료되었는지 확인
      if (Date.now() >= tokenInfo.expires_at) {
        localStorage.removeItem(GOOGLE_CALENDAR_TOKENS_KEY);
        return null;
      }
      
      return tokenInfo;
    } catch {
      localStorage.removeItem(GOOGLE_CALENDAR_TOKENS_KEY);
      return null;
    }
  },

  // 토큰 삭제
  clear: () => {
    localStorage.removeItem(GOOGLE_CALENDAR_TOKENS_KEY);
  },

  // 토큰 유효성 검사
  isValid: (tokenInfo: GoogleTokenInfo): boolean => {
    return Date.now() < tokenInfo.expires_at;
  }
};

const Calendar: React.FC = () => {
  // ===== OAuth / 사용자 상태 =====
  const tokenClientRef = useRef<TokenClient | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ===== 사용자 계정 내 캘린더 목록 & 선택 =====
  const [calendarList, setCalendarList] = useState<CalendarListItem[]>([]);
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

  // 날짜 비교 헬퍼 함수 추가
  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isDateInRange = (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end;
  };

  // ===== 캘린더 목록 로드 함수 =====
  const loadCalendarList = async (token: string) => {
    try {
      const list = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      const items: CalendarListItem[] = (list.items || []).map((c: any) => ({
        id: c.id,
        summary: c.summary,
        accessRole: c.accessRole,
      }));
      setCalendarList(items);

      // 기본 선택 캘린더 설정 (owner 우선, 없으면 primary 유지)
      const owner = items.find((c) => c.accessRole === 'owner');
      if (owner?.id) {
        setSelectedCalendarId(owner.id);
      }
    } catch (e) {
    }
  };

  // ===== 컴포넌트 초기화 시 저장된 토큰 복원 =====
  useEffect(() => {
    const initializeFromStoredTokens = async () => {
      const storedTokens = GoogleTokenManager.get();
      
      if (storedTokens && GoogleTokenManager.isValid(storedTokens)) {
        setAccessToken(storedTokens.access_token);
        setUserEmail(storedTokens.user_email);
        
        // 캘린더 목록과 이벤트 자동 로드
        await loadCalendarList(storedTokens.access_token);
        await fetchGoogleEvents();
      }
      
      setIsInitializing(false);
    };

    initializeFromStoredTokens();
  }, []);

  // ===== OAuth: GIS 스크립트 로드 & 토큰 클라이언트 초기화 =====
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {

      // @ts-ignore
      const googleObj = window.google;
      if (!googleObj?.accounts?.oauth2) {
        
        return;
      }

      tokenClientRef.current = googleObj.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: 'consent', // 첫 로그인 시 동의창
        callback: async (resp: any) => {
          if (resp?.error) {
            return;
          }
          if (!resp?.access_token) {
            return;
          }
          setAccessToken(resp.access_token);

          // 로그인 사용자 확인
          try {
            const me = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            }).then((r) => r.json());
            setUserEmail(me?.email ?? null);

            // 구글 토큰 정보를 로컬 스토리지에 저장 (1시간 후 만료)
            const tokenInfo: GoogleTokenInfo = {
              access_token: resp.access_token,
              refresh_token: resp.refresh_token,
              expires_at: Date.now() + 3600 * 1000, // 1시간
              user_email: me?.email ?? '',
              scope: SCOPES,
            };
            
            GoogleTokenManager.save(tokenInfo);

            // 사용자의 캘린더 목록 로드
            try {
              await loadCalendarList(resp.access_token);
            } catch (e) {
              
            }
          } catch (e) {
            
          }
        },
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const signIn = () => {
    tokenClientRef.current?.requestAccessToken({ prompt: 'consent' });
  };

  const signOut = () => {
    setAccessToken(null);
    setUserEmail(null);
    setCalendarList([]);
    setSelectedCalendarId('primary');
    setGoogleEvents([]);
    GoogleTokenManager.clear(); // 로그아웃 시 토큰 삭제
  };

  // ===== 개인 캘린더: 주간 이벤트 불러오기 (사이드패널 전용) =====
  const fetchGoogleEvents = async () => {
    try {
      setIsLoading(true);
      if (!accessToken) {
        setGoogleEvents([]);
        return;
      }

      const { weekStart, weekEnd } = getWeekRange();

      const calId = selectedCalendarId || 'primary';

      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('timeMin', weekStart.toISOString());
      url.searchParams.set('timeMax', weekEnd.toISOString());
      url.searchParams.set('maxResults', '250');

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        setGoogleEvents([]);
        return;
      }

      const data = await response.json();

      const events: SideEvent[] = (data.items || []).map((item: any, index: number) => {
        const startISO = item.start?.dateTime || item.start?.date;
        const endISO = item.end?.dateTime || item.end?.date;
        const startDate = startISO ? new Date(startISO) : null;
        
        // 종일 이벤트의 경우 시작 시간을 00:00으로 설정
        let timeDisplay = '종일';
        if (item.start?.dateTime) {
          timeDisplay = new Date(item.start.dateTime).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
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
    } catch (error) {
      setGoogleEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 + 5분마다 자동 새로고침 (토큰/선택 캘린더 바뀌면 재설정)
  useEffect(() => {
    if (!accessToken) return; // 로그인 후 동작
    fetchGoogleEvents();
    const id = setInterval(fetchGoogleEvents, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [accessToken, selectedCalendarId]);

  // ===== FullCalendar eventSources =====
  const personalSource = useMemo(
    () => ({
      id: 'my-calendar',
      color: '#4682B4',
      textColor: '#fff',
      events: async (info: any, success: any, failure: any) => {
        try {
          if (!accessToken) {
            success([]);
            return;
          }
          const calId = selectedCalendarId || 'primary';

          const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`);
          url.searchParams.set('singleEvents', 'true');
          url.searchParams.set('orderBy', 'startTime');
          url.searchParams.set('timeMin', new Date(info.startStr).toISOString());
          url.searchParams.set('timeMax', new Date(info.endStr).toISOString());
          url.searchParams.set('maxResults', '2500');

          const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
          if (!res.ok) throw new Error(`GCal error ${res.status} ${res.statusText}`);
          const data = await res.json();

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
    [accessToken, selectedCalendarId]
  );

  const eventSources = useMemo(
    () => [
      ...PUBLIC_SOURCES, // 공개 캘린더(공휴일): plugin + API KEY
      personalSource,    // 개인 캘린더(비공개): OAuth 토큰
    ],
    [personalSource]
  );

  // ===== 유틸 =====
  const { todayStart, todayEnd } = getTodayRange();
  const { weekStart, weekEnd } = getWeekRange();

  const myCalEvents = googleEvents;
  
  // 오늘 일정 필터링 개선
  const myCalEventsToday = useMemo(() => {
    const todayEvents = myCalEvents.filter((ev) => {
      if (!ev.startDate) {
        return false;
      }
      
      // 종일 이벤트의 경우 시작 날짜가 오늘인지 확인
      if (ev.time === '종일') {
        const isToday = isSameDate(ev.startDate, new Date());
        return isToday;
      }
      
      // 시간이 있는 이벤트의 경우 오늘 범위 내에 있는지 확인
      const isInTodayRange = isDateInRange(ev.startDate, todayStart, todayEnd);
      return isInTodayRange;
    });
    return todayEvents.sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));
  }, [myCalEvents, todayStart, todayEnd]);

  // 이번 주 일정 필터링 개선
  const myCalEventsThisWeek = useMemo(() => {
    const weekEvents = myCalEvents.filter((ev) => {
      if (!ev.startDate) {
        return false;
      }
      
      // 종일 이벤트의 경우 주간 범위 내에 있는지 확인
      if (ev.time === '종일') {
        const isInWeekRange = isDateInRange(ev.startDate, weekStart, weekEnd);
        return isInWeekRange;
      }
      
      // 시간이 있는 이벤트의 경우 주간 범위 내에 있는지 확인
      const isInWeekRange = isDateInRange(ev.startDate, weekStart, weekEnd);
      return isInWeekRange;
    });
    return weekEvents.sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));
  }, [myCalEvents, weekStart, weekEnd]);

  // 디버깅 로그 제거

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
          {!accessToken ? (
            <Button onClick={signIn}>Google 로그인</Button>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">로그인: {userEmail ?? '(알 수 없음)'}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold mt-4 mb-2">캘린더</h1>
        <p className="text-muted-foreground">일정을 관리하고 팀 미팅을 확인하세요.</p>
        <p className="text-xs text-muted-foreground mt-1">마지막 업데이트: {lastRefreshTime.toLocaleTimeString('ko-KR')}</p>
        
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
                    const color = (arg.event.source as any)?.internalEventSource?._raw?.color || '#666';
                    return {
                      html: `<div style="font-size:12px;font-weight:500;color:#fff;text-align:center;line-height:1.2;word-wrap:break-word;max-width:100%;background-color:${color};padding:2px 4px;border-radius:3px;">${shortTitle}</div>`
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
              <CardDescription>AI가 추천한 {new Date().toLocaleDateString()} 일정입니다.</CardDescription>
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
                            {ev.startTime && ev.endTime ? `${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}` : ev.time}
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
                            {ev.startDate?.toLocaleDateString()} • {ev.startTime && ev.endTime ? `${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}` : ev.time}
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
                  {selectedEvent.startDate?.toLocaleDateString()} • {selectedEvent.startTime && selectedEvent.endTime ? `${fmtTime(selectedEvent.startTime)} - ${fmtTime(selectedEvent.endTime)}` : selectedEvent.time}
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
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