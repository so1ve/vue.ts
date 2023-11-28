import { defineComponent } from "vue";

type Props = {
	foo: number;
};

const Foo = defineComponent<Props>((props) => () => <div>{props}</div>);
