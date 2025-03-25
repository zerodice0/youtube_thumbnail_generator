/**
 * 이진 힙 기반 우선순위 큐 구현
 */
class PriorityQueue {
  constructor(compareFn = (a, b) => a - b) {
    this.heap = []; // [요소, 우선순위, 삽입순서] 형태의 배열
    this.sequence = 0; // 삽입 순서 추적용
    this.compareFn = compareFn;
  }

  enqueue(element, priority) {
    const seq = this.sequence++;
    this.heap.push([element, priority, seq]);
    return this.siftUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    
    const top = this.heap[0];
    const bottom = this.heap.pop();
    
    if (this.heap.length > 0 && bottom) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }
    
    return top[0];
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0][0];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  clear() {
    this.heap = [];
    this.sequence = 0;
  }

  siftUp(index) {
    let currentIndex = index;
    const inserted = this.heap[currentIndex];
    
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      const parent = this.heap[parentIndex];
      
      const priorityComparison = this.compareFn(inserted[1], parent[1]);
      if (priorityComparison > 0 || (priorityComparison === 0 && inserted[2] > parent[2])) break;
      
      this.heap[currentIndex] = parent;
      currentIndex = parentIndex;
    }
    
    this.heap[currentIndex] = inserted;
    return this.heap.length;
  }

  siftDown(index) {
    const heapSize = this.heap.length;
    const element = this.heap[index];
    let currentIndex = index;
    
    while (currentIndex < heapSize) {
      const leftChildIndex = 2 * currentIndex + 1;
      const rightChildIndex = 2 * currentIndex + 2;
      
      let swapIndex = -1;
      
      if (leftChildIndex < heapSize) {
        const leftChild = this.heap[leftChildIndex];
        const leftComparison = this.compareFn(leftChild[1], element[1]);
        
        if (leftComparison < 0 || (leftComparison === 0 && leftChild[2] < element[2])) {
          swapIndex = leftChildIndex;
        }
      }
      
      if (rightChildIndex < heapSize) {
        const rightChild = this.heap[rightChildIndex];
        const rightComparison = this.compareFn(rightChild[1], element[1]);
        
        if (swapIndex === -1) {
          if (rightComparison < 0 || (rightComparison === 0 && rightChild[2] < element[2])) {
            swapIndex = rightChildIndex;
          }
        } else {
          const leftChild = this.heap[swapIndex];
          const leftRightComparison = this.compareFn(rightChild[1], leftChild[1]);
          
          if (leftRightComparison < 0 || (leftRightComparison === 0 && rightChild[2] < leftChild[2])) {
            swapIndex = rightChildIndex;
          }
        }
      }
      
      if (swapIndex === -1) break;
      
      this.heap[currentIndex] = this.heap[swapIndex];
      currentIndex = swapIndex;
    }
    
    this.heap[currentIndex] = element;
  }
}

/**
 * 힙 기반 우선순위 큐 성능 테스트
 */
function runBenchmark() {
  console.log('== PriorityQueue 성능 테스트 시작 ==');

  // 작은 데이터셋 테스트
  benchmarkOperations(1000);
  
  // 중간 데이터셋 테스트
  benchmarkOperations(10000);
  
  // 큰 데이터셋 테스트 (선택적)
  benchmarkOperations(100000);
  
  console.log('== PriorityQueue 성능 테스트 완료 ==');
}

/**
 * 우선순위 큐 작업(enqueue, dequeue)에 대한 성능 테스트
 */
function benchmarkOperations(size) {
  console.log(`\n--- ${size}개 요소 테스트 ---`);
  
  const queue = new PriorityQueue();
  
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
  const reverseQueue = new PriorityQueue((a, b) => b - a);
  
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

// 벤치마크 실행
console.log('PriorityQueue 벤치마크 실행 중...');
runBenchmark(); 