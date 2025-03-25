/**
 * 이진 힙 기반의 우선순위 큐 구현
 * 
 * 시간 복잡도:
 * - enqueue: O(log n)
 * - dequeue: O(log n)
 * - peek: O(1)
 */
export class PriorityQueue<T> {
  private heap: Array<[T, number, number]> = []; // [element, priority, insertOrder]
  private insertCount = 0; // 삽입 순서를 추적하는 카운터
  
  /**
   * 우선순위 큐 생성자
   * @param compareFn 선택적 비교 함수. 기본값은 숫자 우선순위 비교 (작은 값이 높은 우선순위)
   */
  constructor(
    private compareFn: (a: number, b: number) => number = (a, b) => a - b
  ) {}
  
  /**
   * 요소를 우선순위 큐에 추가
   * @param element 추가할 요소
   * @param priority 요소의 우선순위 값
   * @returns 큐의 크기
   */
  enqueue(element: T, priority: number): number {
    this.heap.push([element, priority, this.insertCount++]);
    return this.siftUp(this.heap.length - 1);
  }
  
  /**
   * 가장 높은 우선순위 요소를 제거하고 반환
   * @returns 가장 높은 우선순위 요소 또는 큐가 비어있을 경우 null
   */
  dequeue(): T | null {
    if (this.isEmpty()) return null;
    
    const top = this.heap[0];
    const bottom = this.heap.pop();
    
    if (this.heap.length > 0 && bottom) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }
    
    return top[0];
  }
  
  /**
   * 가장 높은 우선순위 요소를 제거하지 않고 반환
   * @returns 가장 높은 우선순위 요소 또는 큐가 비어있을 경우 null
   */
  peek(): T | null {
    return this.isEmpty() ? null : this.heap[0][0];
  }
  
  /**
   * 큐가 비어있는지 확인
   * @returns 큐가 비어있으면 true, 그렇지 않으면 false
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }
  
  /**
   * 큐의 크기 반환
   * @returns 큐에 있는 요소의 수
   */
  size(): number {
    return this.heap.length;
  }
  
  /**
   * 큐의 모든 요소 삭제
   */
  clear(): void {
    this.heap = [];
    this.insertCount = 0;
  }
  
  /**
   * 큐의 요소들을 배열로 변환 (우선순위 순서대로)
   * @returns 우선순위 순서대로 정렬된 요소 배열
   */
  toArray(): T[] {
    // 힙을 복사하여 정렬
    const sortedHeap = [...this.heap];
    const result: T[] = [];
    
    const tempQueue = new PriorityQueue<T>(this.compareFn);
    tempQueue.heap = sortedHeap;
    
    while (!tempQueue.isEmpty()) {
      const element = tempQueue.dequeue();
      if (element) {
        result.push(element);
      }
    }
    
    return result;
  }

  /**
   * 두 요소의 우선순위와 삽입 순서를 비교
   */
  private compareItems(a: [T, number, number], b: [T, number, number]): number {
    const priorityCompare = this.compareFn(a[1], b[1]);
    // 우선순위가 같으면 삽입 순서로 비교 (먼저 들어온 것이 우선)
    return priorityCompare === 0 ? a[2] - b[2] : priorityCompare;
  }
  
  /**
   * 요소의 위치를 상향 조정 (힙 속성 유지)
   * @param index 상향 조정할 요소의 인덱스
   * @returns 큐의 크기
   */
  private siftUp(index: number): number {
    let currentIndex = index;
    const inserted = this.heap[currentIndex];
    
    // 요소를 적절한 위치로 상향 이동
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      const parent = this.heap[parentIndex];
      
      // 부모의 우선순위가 더 높거나 같으면 중단
      if (this.compareItems(inserted, parent) >= 0) break;
      
      // 부모 요소를 아래로 이동
      this.heap[currentIndex] = parent;
      currentIndex = parentIndex;
    }
    
    // 최종 위치에 삽입할 요소 배치
    this.heap[currentIndex] = inserted;
    return this.heap.length;
  }
  
  /**
   * 요소의 위치를 하향 조정 (힙 속성 유지)
   * @param index 하향 조정할 요소의 인덱스
   */
  private siftDown(index: number): void {
    const heapSize = this.heap.length;
    const element = this.heap[index];
    let currentIndex = index;
    
    // 요소를 적절한 위치로 하향 이동
    while (currentIndex < heapSize) {
      const leftChildIndex = 2 * currentIndex + 1;
      const rightChildIndex = 2 * currentIndex + 2;
      
      // 교체 대상이 될 자식 인덱스
      let swapIndex = -1;
      
      // 왼쪽 자식이 있고 현재 요소보다 우선순위가 높은 경우
      if (leftChildIndex < heapSize) {
        const leftChild = this.heap[leftChildIndex];
        if (this.compareItems(leftChild, element) < 0) {
          swapIndex = leftChildIndex;
        }
      }
      
      // 오른쪽 자식이 있고, 왼쪽보다 우선순위가 더 높은 경우
      if (rightChildIndex < heapSize) {
        const rightChild = this.heap[rightChildIndex];
        
        // swapIndex가 설정되지 않았거나, 오른쪽 자식이 왼쪽 자식보다 우선순위가 높은 경우
        if (
          (swapIndex === -1 && this.compareItems(rightChild, element) < 0) ||
          (swapIndex !== -1 && this.compareItems(rightChild, this.heap[swapIndex]) < 0)
        ) {
          swapIndex = rightChildIndex;
        }
      }
      
      // 교체할 자식이 없으면 중단
      if (swapIndex === -1) break;
      
      // 자식과 위치 교체
      this.heap[currentIndex] = this.heap[swapIndex];
      currentIndex = swapIndex;
    }
    
    // 최종 위치에 요소 배치
    this.heap[currentIndex] = element;
  }
  
  /**
   * 큐의 내용을 문자열로 변환
   * @returns 큐의 내용을 표현하는 문자열
   */
  toString(): string {
    return this.heap.map(item => 
      `${String(item[0])} (priority: ${item[1]})`
    ).join(', ');
  }
} 