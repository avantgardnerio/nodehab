
export default {
    template: `
      <div>
        <ul id="example-1">
            <li v-for="item in values" :key="item.name">
                <img :src="'/api/photos/' + item.name" />
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
            this.values = await resp.json();
            this.loading = false;
        },
        async onChange(item, model) {
            console.log('change');
        }
    },
}
