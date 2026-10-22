<script setup lang="ts">
import type { RoomSnapshot } from '@atlantis/shared';

defineProps<{ room: RoomSnapshot }>();
</script>

<template>
  <ul class="players">
    <li v-for="member in room.members" :key="member.id" :class="{ active: member.id === room.game?.activePlayerId }">
      {{ member.name }}
      <span v-if="member.id === room.hostId" class="muted">хост</span>
    </li>
  </ul>
</template>
