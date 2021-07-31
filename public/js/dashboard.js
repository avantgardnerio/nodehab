export default {
    template: `
      <div>
      <v-data-table :headers="headers" :items="values" :items-per-page="15">
        <template v-slot:item.current="{ item }">
          <v-switch v-if="item.type === 'switch'" v-model="item.current" disabled></v-switch>
          <v-text-field v-if="item.type === 'int'" v-model="item.current" type="number" label="Number" disabled></v-text-field>
        </template>
        <template v-slot:item.target="{ item }">
          <v-switch v-if="item.type === 'switch'" v-model="item.target"></v-switch>
          <v-text-field v-if="item.type === 'int'" v-model="item.target" type="number" label="Number"></v-text-field>
        </template>
      </v-data-table>
      </div>
    `,
    data() {
        return {
            loading: false,
            snack: false,
            snackColor: '',
            snackText: '',
            headers: [
                { text: 'Name', align: 'left', value: 'name', class: 'tableheader'},
                { text: 'Current', align: 'left', value: 'current', class: 'tableheader'},
                { text: 'Target', align: 'left', value: 'target', class: 'tableheader'},
            ],
            values: [
                {name: "Front lock", type: "switch", current: false, target: false},
                {name: "Garage lock", type: "switch", current: false, target: false},
                {name: "Garage door", type: "switch", current: false, target: false},
                {name: "Master bath fan", type: "switch", current: false, target: false},
                {name: "Main bath fan", type: "switch", current: false, target: false},
                {name: "Master bed temp", type: "int", current: 77, target: 77},
                {name: "Main floor temp", type: "int", current: 75, target: 75},
                {name: "Ground floor temp", type: "int", current: 72, target: 72},
            ]
        }
    },
    created() {
        this.getDataFromApi()
    },
    methods: {
        async getDataFromApi() {
            this.loading = true
            const resp = await fetch(`/api/nodes`);
            // this.values = await resp.json();
            this.loading = false;
        },
    },
}
