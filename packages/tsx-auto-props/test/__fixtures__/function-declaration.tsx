import { defineComponent } from "vue";

type Props = {
	foo: number;
};

const Foo = defineComponent(function (props: Props) {
	return () => <div>{props}</div>;
});
