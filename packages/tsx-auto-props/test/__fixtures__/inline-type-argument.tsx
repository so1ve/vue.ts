import { defineComponent } from "vue";

const Foo = defineComponent((props: { foo: number }) => () => (
	<div>{props}</div>
));
