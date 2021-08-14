export default {
    template: `
      <div>
      <v-data-table :headers="headers" :items="values" :items-per-page="15">
        <template v-slot:item.current="{ item }">
          <v-switch v-if="item.type === 'switch'" v-model="item.current" disabled
                    :true-value="item.trueValue" :false-value="item.falseValue"></v-switch>
          <v-text-field v-if="item.type === 'int'" v-model="item.current" type="number" label="Number" disabled 
                        ></v-text-field>
          <v-select v-if="item.type === 'radio'" v-model="item.current" :items="item.options" disabled></v-select>
        </template>
        <template v-slot:item.target="{ item }" >
          <v-switch v-if="item.write !== undefined && item.type === 'switch'" v-model="item.target" @change="onChange(item)"></v-switch>
          <v-text-field v-if="item.write !== undefined && item.type === 'int'" v-model="item.target" type="number" label="Number"></v-text-field>
          <v-select v-if="item.type === 'radio'" v-model="item.target" :items="item.options" @change="onChange(item)"></v-select>
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
            values: []
        }
    },
    created() {
        this.getDataFromApi()
    },
    methods: {
        async getDataFromApi() {
            this.loading = true
            const resp = await fetch(`/api/dashboard`);
            this.values = await resp.json();
            this.loading = false;
        },
        async onChange(item) {
            const obj = {commandClass: item.commandClass, endpoint: item.endpoint, property: item.write, val: item.target};
            console.log(obj);
            await fetch(`/api/nodes/${item.node}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj),
            });
        }
    },
}
