<template>
    <div>
        <Number
            label="FileId"
            v-model="value.fileId"
            :editMode="editMode"
        />
        <Number
            label="PostId"
            v-model="value.postId"
            :editMode="editMode"
        />
        <String
            label="OriginalName"
            v-model="value.originalName"
            :editMode="editMode"
        />
        <String
            label="StoredName"
            v-model="value.storedName"
            :editMode="editMode"
        />
        <String
            label="FileUrl"
            v-model="value.fileUrl"
            :editMode="editMode"
        />
        <String
            label="FileSize"
            v-model="value.fileSize"
            :editMode="editMode"
        />
        <String
            label="FileType"
            v-model="value.fileType"
            :editMode="editMode"
        />
        <Date
            label="CreatedAt"
            v-model="value.createdAt"
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
    name: 'Attachment',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "attachments",
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
