import { PriorityQueue } from '../../../../lib/modules/queue/priorityQueue';

describe('PriorityQueue', () => {
  let queue: PriorityQueue<string>;

  beforeEach(() => {
    // 각 테스트 전에 빈 큐로 초기화
    queue = new PriorityQueue<string>();
  });

  describe('기본 기능 테스트', () => {
    test('새로 생성된 큐는 비어있어야 함', () => {
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
    });

    test('비어있는 큐에서 dequeue하면 null을 반환해야 함', () => {
      expect(queue.dequeue()).toBeNull();
    });

    test('비어있는 큐에서 peek하면 null을 반환해야 함', () => {
      expect(queue.peek()).toBeNull();
    });

    test('enqueue 후 isEmpty는 false를 반환해야 함', () => {
      queue.enqueue('Item', 1);
      expect(queue.isEmpty()).toBe(false);
    });

    test('enqueue 후 size는 1을 반환해야 함', () => {
      queue.enqueue('Item', 1);
      expect(queue.size()).toBe(1);
    });

    test('clear 후에는 큐가 비어있어야 함', () => {
      queue.enqueue('Item', 1);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
    });
  });

  describe('우선순위 기능 테스트', () => {
    test('우선순위가 높은 요소(낮은 숫자)가 먼저 dequeue되어야 함', () => {
      queue.enqueue('Low Priority', 3);
      queue.enqueue('High Priority', 1);
      queue.enqueue('Medium Priority', 2);

      expect(queue.dequeue()).toBe('High Priority');
      expect(queue.dequeue()).toBe('Medium Priority');
      expect(queue.dequeue()).toBe('Low Priority');
    });

    test('동일한 우선순위의 요소는 먼저 들어온 순서대로 dequeue되어야 함', () => {
      queue.enqueue('First', 1);
      queue.enqueue('Second', 1);
      queue.enqueue('Third', 1);

      expect(queue.dequeue()).toBe('First');
      expect(queue.dequeue()).toBe('Second');
      expect(queue.dequeue()).toBe('Third');
    });

    test('peek은 dequeue 없이 최상위 요소를 반환해야 함', () => {
      queue.enqueue('Low Priority', 3);
      queue.enqueue('High Priority', 1);
      queue.enqueue('Medium Priority', 2);

      expect(queue.peek()).toBe('High Priority');
      expect(queue.size()).toBe(3); // peek 후에도 크기는 변하지 않아야 함
    });
  });

  describe('커스텀 비교 함수 테스트', () => {
    test('역순 우선순위 큐가 올바르게 작동해야 함 (높은 숫자가 더 높은 우선순위)', () => {
      const reverseQueue = new PriorityQueue<string>((a, b) => b - a);
      
      reverseQueue.enqueue('Low Priority', 1);
      reverseQueue.enqueue('High Priority', 3);
      reverseQueue.enqueue('Medium Priority', 2);

      expect(reverseQueue.dequeue()).toBe('High Priority');
      expect(reverseQueue.dequeue()).toBe('Medium Priority');
      expect(reverseQueue.dequeue()).toBe('Low Priority');
    });
  });

  describe('toArray 메서드 테스트', () => {
    test('toArray는 우선순위 순서대로 정렬된 배열을 반환해야 함', () => {
      queue.enqueue('Low Priority', 3);
      queue.enqueue('High Priority', 1);
      queue.enqueue('Medium Priority', 2);

      const array = queue.toArray();
      expect(array).toEqual(['High Priority', 'Medium Priority', 'Low Priority']);
    });

    test('toArray 후에도 원래 큐는 변경되지 않아야 함', () => {
      queue.enqueue('Low Priority', 3);
      queue.enqueue('High Priority', 1);
      queue.enqueue('Medium Priority', 2);

      queue.toArray();
      expect(queue.size()).toBe(3);
      expect(queue.peek()).toBe('High Priority');
    });
  });

  describe('객체 요소 테스트', () => {
    interface Task {
      id: number;
      name: string;
    }

    let taskQueue: PriorityQueue<Task>;

    beforeEach(() => {
      taskQueue = new PriorityQueue<Task>();
    });

    test('객체 요소를 올바르게 처리해야 함', () => {
      const task1 = { id: 1, name: 'Task 1' };
      const task2 = { id: 2, name: 'Task 2' };
      const task3 = { id: 3, name: 'Task 3' };

      taskQueue.enqueue(task1, 3);
      taskQueue.enqueue(task2, 1);
      taskQueue.enqueue(task3, 2);

      expect(taskQueue.dequeue()).toEqual(task2);
      expect(taskQueue.dequeue()).toEqual(task3);
      expect(taskQueue.dequeue()).toEqual(task1);
    });
  });

  describe('toString 메서드 테스트', () => {
    test('toString 메서드가 큐의 내용을 올바르게 표현해야 함', () => {
      queue.enqueue('Item1', 1);
      queue.enqueue('Item2', 2);
      
      const result = queue.toString();
      expect(result).toContain('Item1');
      expect(result).toContain('priority: 1');
      expect(result).toContain('Item2');
      expect(result).toContain('priority: 2');
    });
  });

  describe('에지 케이스 테스트', () => {
    test('많은 요소를 추가하고 제거해도 올바르게 작동해야 함', () => {
      const items = 1000;
      
      // 역순으로 요소 추가 (낮은 우선순위부터)
      for (let i = items; i > 0; i--) {
        queue.enqueue(`Item ${i}`, i);
      }

      expect(queue.size()).toBe(items);

      // 우선순위 순서대로 제거 확인 (높은 우선순위부터)
      for (let i = 1; i <= items; i++) {
        expect(queue.dequeue()).toBe(`Item ${i}`);
      }

      expect(queue.isEmpty()).toBe(true);
    });

    test('dequeue 후 새 요소를 추가해도 올바르게 작동해야 함', () => {
      queue.enqueue('Item1', 2);
      queue.enqueue('Item2', 1);
      
      expect(queue.dequeue()).toBe('Item2');
      
      queue.enqueue('Item3', 3);
      
      expect(queue.dequeue()).toBe('Item1');
      expect(queue.dequeue()).toBe('Item3');
    });
  });
}); 