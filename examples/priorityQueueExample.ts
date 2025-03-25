import { PriorityQueue } from '../lib/modules/dataStructures/PriorityQueue';

// 기본 사용 예제
console.log('==== 기본 우선순위 큐 예제 ====');
const queue = new PriorityQueue<string>();

queue.enqueue('일반 작업', 2);
queue.enqueue('긴급 작업', 1);
queue.enqueue('낮은 우선순위 작업', 3);

console.log('큐 크기:', queue.size()); // 3
console.log('큐 내용:', queue.toString()); // 출력 순서는 우선순위 기준이 아닌 내부 힙 구조 기준

// 우선순위 순서대로 출력
console.log('우선순위 순서대로 요소 출력:');
while (!queue.isEmpty()) {
  console.log(queue.dequeue()); // 긴급 작업, 일반 작업, 낮은 우선순위 작업 순으로 출력
}

// 복잡한 객체 예제
console.log('\n==== 작업 객체 우선순위 큐 예제 ====');
interface Task {
  id: number;
  name: string;
  description: string;
}

const taskQueue = new PriorityQueue<Task>();

taskQueue.enqueue(
  { id: 1, name: '백업', description: '데이터베이스 백업 수행' },
  2
);

taskQueue.enqueue(
  { id: 2, name: '시스템 점검', description: '긴급 보안 패치 적용' },
  1
);

taskQueue.enqueue(
  { id: 3, name: '로그 정리', description: '오래된 로그 파일 정리' },
  3
);

console.log('작업 목록 (우선순위 순서):');
const tasks = taskQueue.toArray();
tasks.forEach(task => {
  console.log(`- ${task.name} (ID: ${task.id}): ${task.description}`);
});

// 역순 우선순위 큐 (높은 숫자가 높은 우선순위)
console.log('\n==== 역순 우선순위 큐 예제 ====');
const reverseQueue = new PriorityQueue<string>((a, b) => b - a);

reverseQueue.enqueue('낮은 점수 항목', 10);
reverseQueue.enqueue('중간 점수 항목', 50);
reverseQueue.enqueue('높은 점수 항목', 100);

console.log('역순 우선순위 큐 내용:');
while (!reverseQueue.isEmpty()) {
  console.log(reverseQueue.dequeue()); // 높은 점수 항목, 중간 점수 항목, 낮은 점수 항목 순으로 출력
}

// 성능 테스트
console.log('\n==== 성능 테스트 ====');
const benchmark = () => {
  const largeQueue = new PriorityQueue<number>();
  console.time('힙 기반 우선순위 큐 작업');
  
  // 많은 요소 추가
  for (let i = 0; i < 100000; i++) {
    largeQueue.enqueue(i, Math.random() * 100000);
  }
  
  // 모든 요소 추출
  while (!largeQueue.isEmpty()) {
    largeQueue.dequeue();
  }
  
  console.timeEnd('힙 기반 우선순위 큐 작업');
};

benchmark(); 