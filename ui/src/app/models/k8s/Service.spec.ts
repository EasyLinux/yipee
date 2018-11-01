import { TestBed } from '@angular/core/testing';
import { PortMapping } from '../common/PortMapping';
import { Finder } from '../parse/Finder';
import { Service } from './Service';
import { NameChangeEvent } from '../Events';

describe('Service', () => {

  const flat1 = {
    'type': 'k8s-service',
    'id': '2a07aeac-43bb-4ddf-8e0b-2dbb6067f47e',
    'name': 'mysql',
    'metadata': {
      'name': 'mysql',
      'labels': {
        'app': 'demo',
        'name': 'mysql'
      }
    },
    'selector': {
      'app': 'demo',
      'name': 'mysql'
    },
    'cluster-ip': '1.2.3.4',
    'service-type': 'ClusterIP'
  };

  it('should handle round trip', () => {
    const a1 = Service.construct(Service.OBJECT_NAME) as Service;
    a1.fromFlat(flat1);
    expect(a1.toFlat()).toEqual(flat1);
    expect(a1.selector.length).toEqual(2);
  });

  it('should fire name change event', () => {
    const a1 = Service.construct(Service.OBJECT_NAME) as Service;
    a1.name = 'foo';
    a1.onNameChange.subscribe((event: NameChangeEvent) => {
      expect(event.oldName).toEqual('foo');
      expect(event.newName).toEqual('bar');
    });
    a1.name = 'bar';
  });

  it('should add and remove service port mapping', () => {
    const finder = new Finder();
    const a1 = Service.construct(Service.OBJECT_NAME) as Service;
    finder.push(a1);
    a1.addServicePortMapping(new PortMapping());
    expect(a1.service_port_mapping.length).toBe(1);
    expect(a1.service_port_mapping[0].defining_service).toBe(a1.id);
    expect(a1.service_port_mapping[0].container_references).toBeFalsy();
    a1.removeServicePortMapping(a1.service_port_mapping[0].id);
    expect(a1.service_port_mapping.length).toBe(0);
  });

  it('should remove service port mapping on remove', () => {
    const finder = new Finder();
    const a1 = Service.construct(Service.OBJECT_NAME) as Service;
    finder.push(a1);
    a1.addServicePortMapping(new PortMapping());
    a1.addServicePortMapping(new PortMapping());
    expect(a1.service_port_mapping.length).toBe(2);
    expect(a1.finder.objects.length).toBe(3);
    a1.remove();
    expect(a1.finder.objects.length).toBe(0);
  });

});
