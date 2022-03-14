
export default {
    template: `
      <div>
        <ul id="example-1">
            <li v-for="item in values" :key="item.name">
                <img :src="'/api/photos/' + item.name" style="width: 100%;" />
            </li>
        </ul>      
      </div>
    `,
    data() {
        return {
            loading: false,
            values: [],
        }
    },
    created() {
        this.getDataFromApi()
    },
    methods: {
        async getDataFromApi() {
            this.loading = true
            const resp = await fetch(`/api/photos`);
            const paths = await resp.json();
            this.values = paths
                .filter((path) => path.name.endsWith(`.jpg`) || path.name.endsWith(`.jpeg`));
            this.loading = false;
        },
        async onChange(item, model) {
            console.log('change');
        }
    },
}
