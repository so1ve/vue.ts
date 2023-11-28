import { defineComponent } from "vue";

const Foo = defineComponent({
	props: {
		foo: {
			type: Number,
			required: true,
		},
	},
	setup: (props: { foo: number }) => () => <div>{props}</div>,
});
