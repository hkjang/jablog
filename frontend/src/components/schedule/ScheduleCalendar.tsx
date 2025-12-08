"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";
import styles from "./calendar.module.css";

interface ScheduledEvent {
  id: number;
  contentId: number;
  title: string;
  platform: string;
  scheduledFor: string;
  status: string;
}

interface CalendarData {
  year: number;
  month: number;
  events: Record<string, ScheduledEvent[]>;
  totalScheduled: number;
}

export default function ScheduleCalendar() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [draggedEvent, setDraggedEvent] = useState<ScheduledEvent | null>(null);

  const API_BASE = "http://localhost:4000";

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/schedule/calendar`, {
        params: { year: currentYear, month: currentMonth }
      });
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch calendar data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handleDragStart = (e: React.DragEvent, event: ScheduledEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const originalDate = new Date(draggedEvent.scheduledFor);
    const newDate = new Date(currentYear, currentMonth - 1, day, 
      originalDate.getHours(), originalDate.getMinutes());

    try {
      await axios.patch(`${API_BASE}/schedule/${draggedEvent.id}`, {
        scheduledFor: newDate.toISOString()
      });
      await fetchCalendarData();
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("일정 변경 중 오류가 발생했습니다.");
    }

    setDraggedEvent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    // Days with events
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = data?.events[dateKey] || [];
      const isToday = 
        new Date().getFullYear() === currentYear &&
        new Date().getMonth() + 1 === currentMonth &&
        new Date().getDate() === day;

      days.push(
        <div
          key={day}
          className={`${styles.day} ${isToday ? styles.today : ""}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, day)}
        >
          <span className={styles.dayNumber}>{day}</span>
          <div className={styles.dayEvents}>
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`${styles.event} ${styles[`event${event.platform}`]}`}
                draggable
                onDragStart={(e) => handleDragStart(e, event)}
                title={event.title}
              >
                <Clock size={10} />
                <span className={styles.eventTime}>
                  {new Date(event.scheduledFor).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                <span className={styles.eventTitle}>{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <span className={styles.moreEvents}>+{dayEvents.length - 3}개 더</span>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>캘린더 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1><CalendarIcon size={24} /> 예약 발행 캘린더</h1>
        <div className={styles.navigation}>
          <button onClick={goToPrevMonth} className={styles.navBtn}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.currentMonth}>
            {currentYear}년 {currentMonth}월
          </span>
          <button onClick={goToNextMonth} className={styles.navBtn}>
            <ChevronRight size={20} />
          </button>
        </div>
        <span className={styles.stats}>
          총 {data?.totalScheduled || 0}개 예약됨
        </span>
      </header>

      <div className={`${styles.calendar} glass-panel`}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((day) => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>
        <div className={styles.days}>
          {renderCalendarDays()}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={`${styles.legendItem} ${styles.eventTISTORY}`}>Tistory</span>
        <span className={`${styles.legendItem} ${styles.eventWORDPRESS}`}>WordPress</span>
        <span className={`${styles.legendItem} ${styles.eventBOTH}`}>Both</span>
      </div>
    </div>
  );
}
