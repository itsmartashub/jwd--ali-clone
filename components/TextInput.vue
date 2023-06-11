<template>
	<div>
		<!-- on je stavio u client-only jeer je dobijao error za sinhrinizaciju wtf -->
		<client-only>
			<input
				:placeholder="placeholder"
				:maxlength="max"
				class="w-full bg-white text-gray-800 border text-sm border-[#EFF0EB] rounded-lg p-3 placeholder-gray-500 focus:outline-none"
				@focus="isFocused = true"
				@blur="isFocused = false"
				:class="
					({ 'border-gray-900': isFocused },
					{ 'border-red-500': error })
				"
				:type="inputType"
				v-model="inputComputed"
				autocomplete="off" />
		</client-only>

		<span v-if="error" class="text-red-500 text-[14px] font-semibold">
			{{ error }}
		</span>
	</div>
</template>

<script setup>
const emit = defineEmits(['update:input'])
const props = defineProps(['input', 'placeholder', 'max', 'inputType', 'error'])
const { input, placeholder, max, inputType, error } = toRefs(props)

let isFocused = ref(false)

// kada gos se promeni input vrednost, setujemo tu vrednost i emitujemo je VAN ove komponente (u address.vue)
const inputComputed = computed({
	get: () => input.value,
	set: (val) => emit('update:input', val),
})
</script>
