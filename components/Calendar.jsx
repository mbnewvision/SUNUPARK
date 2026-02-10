'use client'

import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar({ reservations, onEventClick, onDateSelect, onEventDrop }) {
  const calendarRef = useRef(null)

  const events = reservations.map(res => {
    const statusColors = {
      'Confirmée': '#00843D',
      'En attente': '#F2C300',
      'Annulée': '#EF4444',
    }

    return {
      id: res.id,
      title: `${res.vehicles?.name || 'Véhicule'} - ${res.vehicles?.matricule || ''}`,
      start: res.start_at,
      end: res.end_at,
      backgroundColor: statusColors[res.status] || '#6B7280',
      borderColor: statusColors[res.status] || '#6B7280',
      extendedProps: {
        description: res.description,
        status: res.status,
        vehicle_id: res.vehicle_id,
        user_id: res.user_id,
      }
    }
  })

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        locale="fr"
        buttonText={{
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour'
        }}
        eventClick={(info) => {
          if (onEventClick) {
            onEventClick({
              id: info.event.id,
              title: info.event.title,
              start: info.event.start,
              end: info.event.end,
              ...info.event.extendedProps
            })
          }
        }}
        select={(info) => {
          if (onDateSelect) {
            onDateSelect({
              start: info.start,
              end: info.end,
            })
          }
        }}
        eventDrop={(info) => {
          if (onEventDrop) {
            onEventDrop({
              id: info.event.id,
              start: info.event.start,
              end: info.event.end,
            })
          }
        }}
        eventResize={(info) => {
          if (onEventDrop) {
            onEventDrop({
              id: info.event.id,
              start: info.event.start,
              end: info.event.end,
            })
          }
        }}
        height="auto"
      />
    </div>
  )
}
