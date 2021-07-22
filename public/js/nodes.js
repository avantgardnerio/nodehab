export default {
    template: `
      <div>
      <v-simple-table>
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">class</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="node in nodes" :key="node.id">
            <td>{{ node.id }}</td>
            <td>{{ node.deviceClass }}</td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
      </div>
    `,
    data() {
        return {
            loading: false,
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
        }
    }
}
