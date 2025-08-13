import React, { useMemo, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Plus } from 'lucide-react';

// ✅ .env에서 값 읽기 (Vite: import.meta.env)
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const HOLIDAY_CAL_ID = import.meta.env.VITE_GOOGLE_CAL_HOLIDAY_ID as string;
const MY_CAL_ID = import.meta.env.VITE_GOOGLE_CAL_MY_ID as string;

// ✅ 연동할 Google 캘린더들 (공개 캘린더여야 API Key로 조회 가능)
const CALENDARS = [
  {
    id: 'calendar',
    googleCalendarId: HOLIDAY_CAL_ID,
    color: '#b91c1c', // 공휴일
  },
  {
    id: 'my-calendar',
    googleCalendarId: MY_CAL_ID,
    color: '#4682B4', // 개인 일정
  }
];

const Calendar = () => {
  // 구글 캘린더 이벤트 상태 (사이드패널용: my-calendar 전용)
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 이번 주(월~일) 범위 계산 함수
  const getWeekRange = () => {
    const now = new Date();
    const weekStart = new Date(now);
    const dow = now.getDay(); // 0(일)~6(토)
    const daysToMonday = dow === 0 ? 6 : dow - 1; // 월요일 시작
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 월요일 + 6 = 일요일
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  };

  // 오늘 범위
  const getTodayRange = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return { todayStart, todayEnd };
  };

  // 구글 캘린더에서 이번 주(월~일) 이벤트 가져오기 (my-calendar만)
  const fetchGoogleEvents = async () => {
    try {
      setIsLoading(true);
      const personalCalendar = CALENDARS.find(c => c.id === 'my-calendar');
      if (!personalCalendar) {
        setGoogleEvents([]);
        return;
      }

      const { weekStart, weekEnd } = getWeekRange();

      const url =
        `https://www.googleapis.com/calendar/v3/calendars/` +
        `${encodeURIComponent(personalCalendar.googleCalendarId)}` +
        `/events?key=${encodeURIComponent(GOOGLE_API_KEY)}` +
        `&timeMin=${encodeURIComponent(weekStart.toISOString())}` +
        `&timeMax=${encodeURIComponent(weekEnd.toISOString())}` +
        `&maxResults=100&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Google Calendar API 응답 오류:', response.status, response.statusText);
        setGoogleEvents([]);
        return;
      }

      const data = await response.json();

      const events =
        data.items?.map((item: any, index: number) => {
          // 시작/종료 (종일 이벤트 date, 시간 이벤트 dateTime)
          const startISO = item.start?.dateTime || item.start?.date;
          const endISO = item.end?.dateTime || item.end?.date;

          // 리스트용 가공 필드
          const startDate = startISO ? new Date(startISO) : null;

                      return {
              id: item.id ?? `google-${index}`,
              title: item.summary || '제목 없음',
              time: item.start?.dateTime
                ? new Date(item.start.dateTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '종일',
              location: item.location || '장소 없음',
              startTime: startISO || '',
              endTime: endISO || '',
              startDate,
            };
        }) ?? [];

      setGoogleEvents(events);
    } catch (error) {
      console.error('구글 캘린더 이벤트 가져오기 실패:', error);
      setGoogleEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 이번 주(월~일) 범위로 fetch
  useEffect(() => {
    fetchGoogleEvents();
  }, []);

  // ✅ FullCalendar가 사용할 "여러 소스" 정의: 구글 캘린더만 사용
  const eventSources = useMemo(
    () => [
      // 구글 캘린더 소스들
      ...CALENDARS.map(c => ({
        id: c.id,
        googleCalendarId: c.googleCalendarId,
        color: c.color,
        textColor: '#fff',
      })),
    ],
    []
  );

  // 오늘/이번 주 범위
  const { todayStart, todayEnd } = getTodayRange();
  const { weekStart, weekEnd } = getWeekRange();

  // 사이드패널: my-calendar 데이터만 사용 (이번 주 전체)
  const myCalEvents = googleEvents; // 이미 my-calendar만 fetch
  const myCalEventsToday = myCalEvents
    .filter(ev => ev.startDate && ev.startDate >= todayStart && ev.startDate <= todayEnd)
    .sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));

  const myCalEventsThisWeek = myCalEvents
    .filter(ev => ev.startDate && ev.startDate >= weekStart && ev.startDate <= weekEnd)
    .sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));

  const fmtTime = (timeStr: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
    // 종일 이벤트(date)면 시간이 00:00으로 잡힐 수 있습니다.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">캘린더</h1>
        <p className="text-muted-foreground">
          일정을 관리하고 팀 미팅을 확인하세요.
        </p>
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
                  googleCalendarApiKey={GOOGLE_API_KEY}
                  height="auto"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  locale="ko"
                  buttonText={{
                    today: 'today',
                    prev: '<',
                    next: '>'
                  }}
                  eventDisplay="block"
                  eventContent={(arg) => {
                    const title = arg.event.title || '';
                    const shortTitle = title.length > 6 ? title.substring(0, 6) + '..' : title;
                    const calendar = CALENDARS.find(c => c.id === arg.event.source?.id);
                    const themeColor = calendar ? calendar.color : '#666';
                    return {
                      html: `<div style="font-size:12px;font-weight:500;color:#fff;text-align:center;line-height:1.2;word-wrap:break-word;max-width:100%;background-color:${themeColor};padding:2px 4px;border-radius:3px;">${shortTitle}</div>`
                    };
                  }}
                  dateClick={(info) => {
                    console.log('Selected date:', info.dateStr);
                  }}
                  eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    if (info.event.url) {
                      window.open(info.event.url, '_blank', 'noopener,noreferrer');
                    } else {
                      console.log('Event clicked:', info.event.title);
                    }
                  }}
                />
              </div>
              <Button className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                새 일정 추가
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* 오늘의 일정: my-calendar */}
          <Card>
            <CardHeader>
              <CardTitle>오늘의 일정</CardTitle>
              <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">일정을 불러오는 중...</div>
                ) : myCalEventsToday.length === 0 ? (
                  <div className="text-sm text-muted-foreground">오늘 일정이 없습니다.</div>
                ) : (
                  myCalEventsToday.map((ev) => (
                    <div key={ev.id} className="p-4 border rounded-lg">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{ev.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {ev.startTime && ev.endTime
                              ? `${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}`
                              : ev.time}
                          </div>
                          {ev.location && ev.location !== '장소 없음' && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {ev.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 이번 주 일정: my-calendar - 오늘 제외 X, 주간 전체 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 주 일정</CardTitle>
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
                      <div>
                        <p className="font-medium">{ev.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ev.startDate?.toLocaleDateString()} • {ev.startTime && ev.endTime
                            ? `${fmtTime(ev.startTime)} - ${fmtTime(ev.endTime)}`
                            : ev.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
