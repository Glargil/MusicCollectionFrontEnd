const baseURL = "https://musiccollectionrest.azurewebsites.net/api/Record"

Vue.createApp({
    data() {
        return {
            records:[],
            id:null,
            title:"",
            artist:"",
            publicationYear:null,
            duration:null
        }
    },
    methods: {
getAll(){
    axios.get(baseURL)
    .then(response => {
        this.records = response.data
    })
    .catch(error => {
        console.error(error)
    })
},
SearchRecord(title,artist){
    axios.get(`${baseURL}?title=${title}&artist=${artist}`)
    .then(response => {
        this.records = response.data
    })
    .catch(error => {
        console.error(error)
     })
    }   
} 
    }).mount("#app")