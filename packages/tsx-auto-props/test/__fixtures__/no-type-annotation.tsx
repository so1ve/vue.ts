import { defineComponent } from "vue";

const Foo = defineComponent((props) => () => <div>{props}</div>);
