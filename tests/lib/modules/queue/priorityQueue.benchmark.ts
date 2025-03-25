import { PriorityQueue } from '../../../../lib/modules/queue/priorityQueue';

/**
 * 힙 기반 우선순위 큐 성능 테스트
 */
export function runBenchmark() {
  console.log('== PriorityQueue 성능 테스트 시작 ==');

  // 작은 데이터셋 테스트
  benchmarkOperations(1000);
  
  // 중간 데이터셋 테스트
  benchmarkOperations(10000);
  
  // 큰 데이터셋 테스트 (주의: 실행 시간이 오래 걸릴 수 있음)
  // benchmarkOperations(100000);
  
  console.log('== PriorityQueue 성능 테스트 완료 ==');
}

/**
 * 우선순위 큐 작업(enqueue, dequeue)에 대한 성능 테스트
 */
function benchmarkOperations(size: number) {
  console.log(`\n--- ${size}개 요소 테스트 ---`);
  
  const queue = new PriorityQueue<number>();
  
  // Enqueue 테스트
  console.time(`Enqueue ${size}개 요소`);
  for (let i = 0; i < size; i++) {
    // 랜덤 우선순위를 가진 요소 추가
    queue.enqueue(i, Math.random() * size);
  }
  console.timeEnd(`Enqueue ${size}개 요소`);
  
  // 랜덤 액세스 테스트
  console.time(`Peek ${size}개 요소에서 100번 수행`);
  for (let i = 0; i < 100; i++) {
    queue.peek();
  }
  console.timeEnd(`Peek ${size}개 요소에서 100번 수행`);
  
  // Dequeue 테스트
  console.time(`Dequeue ${size}개 요소`);
  while (!queue.isEmpty()) {
    queue.dequeue();
  }
  console.timeEnd(`Dequeue ${size}개 요소`);
  
  // 역순 우선순위로 Enqueue + Dequeue 테스트
  const reverseQueue = new PriorityQueue<number>((a, b) => b - a);
  
  console.time(`역순 우선순위 큐 Enqueue ${size}개 요소`);
  for (let i = 0; i < size; i++) {
    reverseQueue.enqueue(i, Math.random() * size);
  }
  console.timeEnd(`역순 우선순위 큐 Enqueue ${size}개 요소`);
  
  console.time(`역순 우선순위 큐 Dequeue ${size}개 요소`);
  while (!reverseQueue.isEmpty()) {
    reverseQueue.dequeue();
  }
  console.timeEnd(`역순 우선순위 큐 Dequeue ${size}개 요소`);
}

// 직접 실행하려면 아래 주석을 제거하세요
// runBenchmark(); 