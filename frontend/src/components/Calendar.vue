<template>
    <div>
        <String
            label="CalendarId"
            v-model="value.calendarId"
            :editMode="editMode"
        />
        <String
            label="TaskId"
            v-model="value.taskId"
            :editMode="editMode"
        />
        <String
            label="AgentId"
            v-model="value.agentId"
            :editMode="editMode"
        />
        <String
            label="StartTime"
            v-model="value.startTime"
            :editMode="editMode"
        />
        <String
            label="EndTime"
            v-model="value.endTime"
            :editMode="editMode"
        />
        <String
            label="Status"
            v-model="value.status"
            :editMode="editMode"
        />
        <v-row class="ma-0 pa-0">
            <v-spacer></v-spacer>
            <v-btn width="64px" color="primary" @click="save">
                저장
            </v-btn>
        </v-row>
    </div>
</template>


<script>
import BaseEntity from './base-ui/BaseEntity.vue'

export default {
    name: 'Calendar',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "calendars",
        value: {
        }
    }),
    created(){
    },
    computed:{
    },
    methods: {
    },
}
</script>
