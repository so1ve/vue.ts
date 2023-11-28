import { defineComponent } from "vue";

const Foo = defineComponent<{ foo: number }>((props) => () => (
	<div>{props}</div>
));
