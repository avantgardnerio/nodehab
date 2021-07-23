export default {
    template: `
      <div>
      <v-data-table :headers="headers" :items="values" @click:row="handleClick">
      </v-data-table>
      </div>
    `,
    data() {
        return {
            loading: false,
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
            this.loading = false;
        },
        handleClick(row) {
            console.log(row.id);
            this.$router.push(`/nodes/${row.id}`);
        },
    }
}
