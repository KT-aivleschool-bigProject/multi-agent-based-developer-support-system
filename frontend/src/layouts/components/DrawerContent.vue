<script setup>
import {
  VerticalNavLink,
  VerticalNavSectionTitle,
} from '@layouts'
</script>

<template>
    <ul>
        <VerticalNavSectionTitle :item="{ heading: '사용자 관리' }" />
        <VerticalNavLink
            :item="{
                title: '사용자',
                to: '/users',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '코드지원관리' }" />
        <VerticalNavSectionTitle :item="{ heading: '업무관리' }" />
        <VerticalNavLink
            :item="{
                title: 'TaskAssignment',
                to: '/taskAssignments',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: 'Slack 분석' }" />
        <VerticalNavSectionTitle :item="{ heading: '캘린더' }" />
        <VerticalNavLink
            :item="{
                title: 'Calendar',
                to: '/calendars',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '알림' }" />
        <VerticalNavLink
            :item="{
                title: 'Notification',
                to: '/notifications',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '문서 게시판' }" />
        <VerticalNavLink
            :item="{
                title: '게시글',
                to: '/posts',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '첨부파일',
                to: '/attachments',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '댓글',
                to: '/comments',
            }"
        />
    </ul>
</template>
