import { defineComponent } from "vue";

const Foo = defineComponent({
	setup: (props: { foo: number }) => () => <div>{props}</div>,
});
