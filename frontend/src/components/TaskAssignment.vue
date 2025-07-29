<template>
    <div>
        <String
            label="TaskId"
            v-model="value.taskId"
            :editMode="editMode"
        />
        <String
            label="Title"
            v-model="value.title"
            :editMode="editMode"
        />
        <String
            label="Description"
            v-model="value.description"
            :editMode="editMode"
        />
        <String
            label="AssignmentAgentId"
            v-model="value.assignmentAgentId"
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
    name: 'TaskAssignment',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "taskAssignments",
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
