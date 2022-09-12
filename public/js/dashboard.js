
let deferredPrompt;
export default {
    template: `
      <div>
      <v-btn v-on:click="subscribe">Subscribe!</v-btn>
      <v-btn v-on:click="install" v-if="canAdd">Install!</v-btn>
      <v-data-table :headers="headers" :items="values" :items-per-page="100">
        <template v-slot:item.current="{ item }">
          <v-switch v-if="item.type === 'switch'" v-model="item.current" :disabled="item.write === undefined" @change="onChange(item, 'current')"
                    :true-value="item.trueValue" :false-value="item.falseValue"></v-switch>
          <v-text-field v-if="item.type === 'int'" v-model="item.current" type="number" label="Number" :disabled="item.write === undefined" 
                    @change="onChange(item, 'current')"></v-text-field>
          <v-select v-if="item.type === 'radio'" v-model="item.current" :items="item.options" :disabled="item.write === undefined"
                    @change="onChange(item, 'current')"></v-select>
        </template>
      </v-data-table>
      </div>
    `,
    data() {
        return {
            canAdd: false,
            loading: false,
            snack: false,
            snackColor: '',
            snackText: '',
            headers: [
                { text: 'Name', align: 'left', value: 'name', class: 'tableheader'},
                { text: 'Current', align: 'left', value: 'current', class: 'tableheader'},
            ],
            values: []
        }
    },
    created() {
        this.getDataFromApi()
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.canAdd = true;
          });
    },
    methods: {
        async getDataFromApi() {
            this.loading = true
            const resp = await fetch(`/api/dashboard`);
            this.values = await resp.json();
            this.loading = false;
        },
        async subscribe() {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("The user accepted!");
                    const notification = new Notification("Hello World!");
                }
            });
        },
        async install() {
            this.canAdd = false;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        },
        async onChange(item, model) {
            if(item.type === 'int') {
                item[model] = parseInt(item[model]);
            }
            const obj = {commandClass: item.commandClass, endpoint: item.endpoint, property: item.write, propertyKey: item.propertyKey, val: item[model]};
            console.log(obj);
            await fetch(`/api/nodes/${item.node}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj),
            });
        }
    },
}
