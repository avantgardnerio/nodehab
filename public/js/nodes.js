export default {
    template: `
      <div>
      <v-data-table :headers="headers" :items="nodes" @click:row="handleClick">
        <template slot="items" slot-scope="props">
          <tr>
            <td>
              <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
            </td>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.deviceClass}}</td>
          </tr>
        </template>
      </v-data-table>
      </div>
    `,
    data() {
        return {
            loading: false,
            headers: [
                { text: 'ID', align: 'left', value: 'id', class: 'tableheader'},
                { text: 'Class', align: 'left', value: 'deviceClass', class: 'tableheader'},
            ],
            nodes: []
        }
    },
    created() {
        this.getDataFromApi()
    },
    methods: {
        async getDataFromApi() {
            this.loading = true
            const resp = await fetch(`/api/nodes`);
            this.nodes = await resp.json();
            this.loading = false;
        },
        handleClick(row) {
            console.log(row);
        },
    }
}
