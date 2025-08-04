import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Users, MapPin } from 'lucide-react';

const Calendar = () => {
  const events = [
    {
      id: 1,
      title: "팀 회의",
      time: "09:00 - 10:00",
      date: "2024-01-15",
      type: "meeting",
      attendees: 5,
      location: "회의실 A",
    },
    {
      id: 2,
      title: "코드 리뷰",
      time: "14:00 - 15:00",
      date: "2024-01-15",
      type: "review",
      attendees: 3,
      location: "온라인",
    },
    {
      id: 3,
      title: "프로젝트 발표",
      time: "16:00 - 17:00",
      date: "2024-01-15",
      type: "presentation",
      attendees: 12,
      location: "대회의실",
    },
  ];

  // FullCalendar 이벤트 형식으로 변환
  const fullCalendarEvents = events.map(event => ({
    id: event.id.toString(),
    title: event.title,
    date: event.date,
    backgroundColor: event.type === 'meeting' ? '#3b82f6' : 
                    event.type === 'review' ? '#10b981' : '#8b5cf6',
    borderColor: event.type === 'meeting' ? '#3b82f6' : 
                event.type === 'review' ? '#10b981' : '#8b5cf6',
  }));

  const upcomingEvents = events.filter(event => 
    new Date(event.date) >= new Date()
  );

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-green-100 text-green-800';
      case 'presentation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={fullCalendarEvents}
                  height="auto"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  locale="ko"
                  buttonText={{
                    today: '오늘',
                    prev: '이전',
                    next: '다음'
                  }}
                  dateClick={(info) => {
                    console.log('Selected date:', info.dateStr);
                  }}
                  eventClick={(info) => {
                    console.log('Event clicked:', info.event.title);
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
          <Card>
            <CardHeader>
              <CardTitle>오늘의 일정</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString()} 예정된 일정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type === 'meeting' ? '회의' : 
                           event.type === 'review' ? '리뷰' : '발표'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.attendees}명
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      참여
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>이번 주 일정</CardTitle>
              <CardDescription>
                이번 주에 예정된 모든 일정을 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.time}
                      </p>
                    </div>
                    <Badge variant="secondary">{event.location}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;