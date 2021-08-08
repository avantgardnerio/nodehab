export default {
    template: `
      <div>
      <v-btn v-on:click="failedClick">{{failedMsg}}</v-btn>
      <v-data-table :headers="headers" :items="values" :items-per-page="15">
        <template v-slot:item.val="props">
          <v-edit-dialog :return-value.sync="props.item.val" @save="save" @cancel="cancel" @open="open" @close="close" >
            {{ props.item.val }}
            <template v-slot:input>
              <v-text-field v-model="props.item.val" label="Edit" single-line counter
                            @keyup.enter="onUpdateCourse(props.item)"
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
      </v-data-table>
      <v-snackbar v-model="snack" :timeout="3000" :color="snackColor" >
        {{ snackText }}
        <template v-slot:action="{ attrs }">
          <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
        </template>
      </v-snackbar>
      </div>
    `,
    data() {
        return {
            loading: false,
            snack: false,
            snackColor: '',
            snackText: '',
            failedMsg: 'Has node failed?',
            headers: [
                { text: 'Command Class', align: 'left', value: 'commandClassName', class: 'tableheader'},
                { text: 'Property', align: 'left', value: 'prop', class: 'tableheader'},
                { text: 'Value', align: 'left', value: 'val', class: 'tableheader'},
            ],
            values: []
        }
    },
    created() {
        this.getDataFromApi()
    },
    methods: {
        async getDataFromApi() {
            this.loading = true
            const resp = await fetch(`/api/nodes/${this.$route.params.id}`);
            this.values = await resp.json();
            this.values.forEach(it => it.prop = it.propertyKeyName || it.propertyName || it.property);
            this.values.forEach(it => it.orig = it.val);
            this.loading = false;
        },
        async onUpdateCourse(row) {
            if(typeof row.orig === 'boolean') {
                row.val = row.val === true || row.val === 'true';
            } else if(typeof row.orig === 'number') {
                row.val = parseFloat(row.val);
            }
            console.log(`${new Date()} setting ${row.commandClass} ${row.prop} to ${row.val}`);
            await fetch(`/api/nodes/${this.$route.params.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(row),
            });
        },
        save() {
            this.snack = true
            this.snackColor = 'success'
            this.snackText = 'Data saved'
        },
        cancel () {
            this.snack = true
            this.snackColor = 'error'
            this.snackText = 'Canceled'
        },
        open () {
            this.snack = true
            this.snackColor = 'info'
            this.snackText = 'Dialog opened'
        },
        close () {
            console.log('Dialog closed');
        },
        async failedClick() {
            if(this.failedMsg.includes('failed?')) {
                this.failedMsg = 'Checking node failure...';
                const resp = await fetch(`/api/nodes/${this.$route.params.id}/failed`);
                const isFailed = await resp.json();
                this.failedMsg = isFailed ? 'Remove failed node' : 'Node is healthy';
                return;
            }
            if(this.failedMsg.toLowerCase().includes('remove')) {
                await fetch(`/api/nodes/${this.$route.params.id}/remove`, {method: 'POST'});
                this.$router.push(`/controller`);
            }
        }
    },
}
